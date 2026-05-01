#include "CsvParser.h"
#include <QStringConverter>

QChar CsvParser::detectSeparator(const QString& content) {
    // Count common separators in the first few lines
    QString sample = content.left(2000);
    int commaCount = sample.count(',');
    int tabCount = sample.count('\t');
    int semicolonCount = sample.count(';');
    int pipeCount = sample.count('|');

    if (tabCount > commaCount && tabCount > semicolonCount && tabCount > pipeCount)
        return '\t';
    if (semicolonCount > commaCount && semicolonCount > pipeCount)
        return ';';
    if (pipeCount > commaCount)
        return '|';
    return ',';
}

QString CsvParser::detectEncoding(const QByteArray& rawData) {
    // Check BOM first
    if (rawData.startsWith("\xEF\xBB\xBF")) return "UTF-8";
    if (rawData.startsWith("\xFF\xFE")) return "UTF-16LE";
    if (rawData.startsWith("\xFE\xFF")) return "UTF-16BE";

    // Check if valid UTF-8 by attempting decode
    QString text = QString::fromUtf8(rawData.left(8192));
    // If replacement character appears frequently, it's likely not UTF-8
    bool hasReplacement = false;
    int checkLen = static_cast<int>(std::min(text.length(), static_cast<qsizetype>(2000)));
    for (int i = 0; i < checkLen; ++i) {
        if (text[i].unicode() == 0xFFFD) {
            hasReplacement = true;
            break;
        }
    }
    if (!hasReplacement) return "UTF-8";

    // Fallback to GBK
    return "GBK";
}

Table CsvParser::parseContent(const QString& content, QChar separator) {
    Table table;
    if (content.isEmpty()) return table;

    QStringList lines = content.split('\n');
    for (const QString& line : lines) {
        QString trimmed = line.trimmed();
        if (trimmed.isEmpty()) continue;

        Row row;
        bool inQuotes = false;
        QString currentField;

        for (int i = 0; i < trimmed.length(); ++i) {
            QChar ch = trimmed[i];

            if (ch == '"') {
                if (inQuotes && i + 1 < trimmed.length() && trimmed[i + 1] == '"') {
                    currentField += '"';
                    ++i;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == separator && !inQuotes) {
                row.append({currentField});
                currentField.clear();
            } else {
                currentField += ch;
            }
        }
        row.append({currentField});

        if (!row.isEmpty()) {
            table.append(row);
        }
    }

    return table;
}

Table CsvParser::parseFile(const QString& filePath, QString& errorMsg, bool /*hasHeader*/) {
    QFile file(filePath);
    if (!file.exists()) {
        errorMsg = QString("文件未找到：%1").arg(filePath);
        return {};
    }
    if (!file.open(QIODevice::ReadOnly)) {
        errorMsg = QString("无法打开文件：%1").arg(filePath);
        return {};
    }

    // Read raw bytes
    QByteArray rawData = file.readAll();
    file.close();

    if (rawData.isEmpty()) {
        return {};
    }

    // Detect encoding
    QString encoding = detectEncoding(rawData);

    // Decode to QString
    QString content;
    if (encoding == "UTF-8") {
        // Skip BOM if present
        int offset = rawData.startsWith("\xEF\xBB\xBF") ? 3 : 0;
        content = QString::fromUtf8(rawData.mid(offset));
    } else if (encoding == "GBK") {
        content = QString::fromLocal8Bit(rawData);
    } else {
        content = QString::fromUtf8(rawData);
    }

    QChar separator = detectSeparator(content);
    return parseContent(content, separator);
}

Table CsvParser::parseFilePreview(const QString& filePath, QString& errorMsg, int maxRows) {
    QFile file(filePath);
    if (!file.exists()) {
        errorMsg = QString("文件未找到：%1").arg(filePath);
        return {};
    }
    if (!file.open(QIODevice::ReadOnly)) {
        errorMsg = QString("无法打开文件：%1").arg(filePath);
        return {};
    }

    // Only read first 64KB for preview - fast even for huge files
    QByteArray rawData = file.read(65536);
    file.close();

    if (rawData.isEmpty()) {
        return {};
    }

    // Detect encoding
    QString encoding = detectEncoding(rawData);

    // Decode
    QString content;
    if (encoding == "UTF-8") {
        int offset = rawData.startsWith("\xEF\xBB\xBF") ? 3 : 0;
        content = QString::fromUtf8(rawData.mid(offset));
    } else if (encoding == "GBK") {
        content = QString::fromLocal8Bit(rawData);
    } else {
        content = QString::fromUtf8(rawData);
    }

    QChar separator = detectSeparator(content);
    Table table = parseContent(content, separator);

    // Trim to maxRows
    if (table.size() > maxRows) {
        table = table.mid(0, maxRows);
    }

    return table;
}

// ============================================================
// CsvStreamReader - Streaming row-by-row reader (constant memory)
// ============================================================

CsvStreamReader::~CsvStreamReader() { close(); }

CsvStreamReader::CsvStreamReader(CsvStreamReader&& other) noexcept
    : m_separator(other.m_separator), m_fileSize(other.m_fileSize)
{
    // QFile doesn't support move; swap file handles by re-opening
    if (other.m_file.isOpen()) {
        m_file.setFileName(other.m_file.fileName());
        // We'll reopen in open() - just take the stream pointer
        m_stream = other.m_stream;
        other.m_stream = nullptr;
        other.m_file.close();
    }
}

CsvStreamReader& CsvStreamReader::operator=(CsvStreamReader&& other) noexcept {
    if (this != &other) {
        close();
        m_separator = other.m_separator;
        m_fileSize = other.m_fileSize;
        if (other.m_file.isOpen()) {
            m_file.setFileName(other.m_file.fileName());
            m_stream = other.m_stream;
            other.m_stream = nullptr;
            other.m_file.close();
        }
    }
    return *this;
}

bool CsvStreamReader::open(const QString& filePath, QString& errorMsg) {
    close();
    m_file.setFileName(filePath);
    if (!m_file.open(QIODevice::ReadOnly)) {
        errorMsg = QString("无法打开文件：%1").arg(filePath);
        return false;
    }
    m_fileSize = m_file.size();

    // Peek first bytes for encoding + separator detection
    QByteArray peek = m_file.peek(8192);
    QString encoding = CsvParser::detectEncoding(peek);

    // Skip BOM manually ( QTextStream won't do it )
    if (peek.startsWith("\xEF\xBB\xBF")) m_file.seek(3);
    else if (peek.startsWith("\xFF\xFE")) m_file.seek(2);
    else if (peek.startsWith("\xFE\xFF")) m_file.seek(2);

    // Detect separator from first few KB
    QString peekStr = (encoding == "GBK")
        ? QString::fromLocal8Bit(peek.left(4096))
        : QString::fromUtf8(peek.left(4096));
    m_separator = CsvParser::detectSeparator(peekStr);

    // Create text stream for line-by-line reading
    m_stream = new QTextStream(&m_file);
    m_stream->setEncoding(
        (encoding == "GBK" || encoding == "GB2312")
            ? QStringConverter::System
            : QStringConverter::Utf8
    );

    return true;
}

void CsvStreamReader::close() {
    delete m_stream;
    m_stream = nullptr;
    if (m_file.isOpen()) m_file.close();
}

bool CsvStreamReader::readRow(Row& row) {
    if (!m_stream) return false;

    QString line = m_stream->readLine();
    if (line.isNull()) return false;

    // Handle multi-line quoted fields (embedded newlines)
    while (hasUnclosedQuote(line)) {
        QString next = m_stream->readLine();
        if (next.isNull()) break;
        line += '\n' + next;
    }

    parseRow(line, row);
    return true;
}

void CsvStreamReader::parseRow(const QString& line, Row& row) {
    row.clear();
    QString trimmed = line.trimmed();
    if (trimmed.isEmpty()) { row.append({""}); return; }

    // Fast path: no quotes → simple split (vastly faster for typical data)
    if (!trimmed.contains('"')) {
        for (const auto& p : trimmed.split(m_separator, Qt::KeepEmptyParts))
            row.append({p});
        return;
    }

    // Slow path: handle quoted fields with escaping
    bool inQuotes = false;
    QString cur;
    for (int i = 0; i < trimmed.length(); ++i) {
        QChar ch = trimmed[i];
        if (ch == '"') {
            if (inQuotes && i + 1 < trimmed.length() && trimmed[i + 1] == '"') {
                cur += '"'; ++i; // escaped double-quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch == m_separator && !inQuotes) {
            row.append({cur}); cur.clear();
        } else {
            cur += ch;
        }
    }
    row.append({cur});
}

bool CsvStreamReader::hasUnclosedQuote(const QString& s) {
    bool inQuotes = false;
    for (int i = 0; i < s.length(); ++i) {
        if (s[i] == '"') {
            if (inQuotes && i + 1 < s.length() && s[i + 1] == '"') { ++i; }
            else { inQuotes = !inQuotes; }
        }
    }
    return inQuotes;
}
