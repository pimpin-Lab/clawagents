#pragma once

#include <QString>
#include <QList>
#include <QVector>
#include <QFile>
#include <QTextStream>

struct CellData {
    QString text;
    bool isEmpty() const { return text.trimmed().isEmpty(); }
};

using Row = QVector<CellData>;
using Table = QVector<Row>;

class CsvParser {
public:
    // Parse a CSV file fully (for merge operations)
    static Table parseFile(const QString& filePath, QString& errorMsg, bool hasHeader = true);

    // Parse only first N rows for preview (reads only ~64KB, fast for large files)
    static Table parseFilePreview(const QString& filePath, QString& errorMsg, int maxRows = 25);

    // Get detected separator
    static QChar detectSeparator(const QString& content);

    // Encoding detection (used by CsvStreamReader)
    static QString detectEncoding(const QByteArray& rawData);

private:
    static Table parseContent(const QString& content, QChar separator);
};

// Streaming CSV reader - reads one row at a time, constant memory
class CsvStreamReader {
public:
    CsvStreamReader() = default;
    ~CsvStreamReader();

    CsvStreamReader(const CsvStreamReader&) = delete;
    CsvStreamReader& operator=(const CsvStreamReader&) = delete;
    CsvStreamReader(CsvStreamReader&& other) noexcept;
    CsvStreamReader& operator=(CsvStreamReader&& other) noexcept;

    bool open(const QString& filePath, QString& errorMsg);
    void close();
    bool readRow(Row& row);

    QChar separator() const { return m_separator; }
    qint64 fileSize() const { return m_fileSize; }
    bool isOpen() const { return m_file.isOpen(); }

private:
    QFile m_file;
    QTextStream* m_stream = nullptr;
    QChar m_separator = ',';
    qint64 m_fileSize = 0;

    void parseRow(const QString& line, Row& row);
    static bool hasUnclosedQuote(const QString& s);
};
