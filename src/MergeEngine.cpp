#include "MergeEngine.h"
#include "CsvParser.h"
#include "ExcelParser.h"
#include <QFile>
#include <QTextStream>
#include <QFileInfo>
#include <QDebug>
#include <algorithm>

// ============================================================
// Anonymous namespace: streaming merge helpers
// ============================================================
namespace {

// Write one row to CSV file (fast, no intermediate Table)
void writeRowToCSV(QFile& file, const Row& row, QChar sep, bool useGbk) {
    QByteArray line;
    line.reserve(row.size() * 64); // pre-allocate to reduce reallocs
    for (int c = 0; c < row.size(); ++c) {
        if (c > 0) line += sep.toLatin1();
        const QString& field = row[c].text;
        if (field.contains(sep) || field.contains('"') || field.contains('\n') || field.contains('\r')) {
            QString escaped = field;
            escaped.replace('"', "\"\"");
            escaped = "\"" + escaped + "\"";
            line += useGbk ? escaped.toLocal8Bit() : escaped.toUtf8();
        } else {
            line += useGbk ? field.toLocal8Bit() : field.toUtf8();
        }
    }
    line += "\n";
    file.write(line);
}

// Streaming AppendRows: read one file at a time, write rows directly
MergeResult streamAppendRows(const QStringList& filePaths, const MergeOptions& options,
                               QString& errorMsg, std::function<void(int)> progress) {
    MergeResult result;
    result.outputFilePath = options.outputFilePath;

    qint64 totalBytes = 0;
    for (const auto& f : filePaths) totalBytes += QFileInfo(f).size();
    qint64 processedBytes = 0;

    QFile outFile(options.outputFilePath);
    if (!outFile.open(QIODevice::WriteOnly)) {
        errorMsg = QString("无法写入文件：%1").arg(options.outputFilePath);
        return result;
    }

    bool useGbk = (options.encoding.toUpper() == "GBK" || options.encoding.toUpper() == "GB2312");
    if (!useGbk) outFile.write("\xEF\xBB\xBF"); // UTF-8 BOM for Excel
    QChar outSep = options.csvSeparator;

    for (int fi = 0; fi < filePaths.size(); ++fi) {
        CsvStreamReader reader;
        QString err;
        if (!reader.open(filePaths[fi], err)) {
            errorMsg = err;
            return result;
        }
        result.mergedFiles.append(QFileInfo(filePaths[fi]).fileName());

        Row row;
        int rowCount = 0;
        while (reader.readRow(row)) {
            // Skip header row of subsequent files
            if (fi > 0 && options.includeHeader && rowCount == 0) {
                rowCount++;
                continue;
            }
            rowCount++;

            // Collect first 25 rows for preview
            if (result.previewData.size() < 25) {
                result.previewData.append(row);
            }

            writeRowToCSV(outFile, row, outSep, useGbk);
            result.totalRows++;
            result.totalColumns = std::max(result.totalColumns, static_cast<int>(row.size()));
        }

        processedBytes += reader.fileSize();
        if (progress) progress(static_cast<int>(processedBytes * 100 / std::max(totalBytes, qint64(1))));
    }

    outFile.close();
    return result;
}

// Streaming AppendColumns: all files open simultaneously, one row at a time
MergeResult streamAppendColumns(const QStringList& filePaths, const MergeOptions& options,
                                  QString& errorMsg, std::function<void(int)> progress) {
    MergeResult result;
    result.outputFilePath = options.outputFilePath;
    qint64 totalBytes = 0;
    for (const auto& f : filePaths) totalBytes += QFileInfo(f).size();

    // Open all readers
    int numFiles = filePaths.size();
    QVector<CsvStreamReader*> readers(numFiles, nullptr);
    QVector<int> fileColCounts(numFiles, 0);

    for (int fi = 0; fi < numFiles; ++fi) {
        readers[fi] = new CsvStreamReader();
        QString err;
        if (!readers[fi]->open(filePaths[fi], err)) {
            errorMsg = err;
            qDeleteAll(readers);
            return result;
        }
        result.mergedFiles.append(QFileInfo(filePaths[fi]).fileName());
    }

    QFile outFile(options.outputFilePath);
    if (!outFile.open(QIODevice::WriteOnly)) {
        errorMsg = QString("无法写入文件：%1").arg(options.outputFilePath);
        qDeleteAll(readers);
        return result;
    }

    bool useGbk = (options.encoding.toUpper() == "GBK" || options.encoding.toUpper() == "GB2312");
    if (!useGbk) outFile.write("\xEF\xBB\xBF");
    QChar outSep = options.csvSeparator;

    // Read and merge headers from all files
    Row mergedHeader;
    for (int fi = 0; fi < numFiles; ++fi) {
        Row header;
        readers[fi]->readRow(header);
        fileColCounts[fi] = header.size();
        for (const auto& cell : header) mergedHeader.append(cell);
    }
    writeRowToCSV(outFile, mergedHeader, outSep, useGbk);
    result.totalColumns = mergedHeader.size();

    // Stream data rows: read one row from each file, concatenate columns
    int numActive = numFiles;
    qint64 processedBytes = 0;

    while (numActive > 0) {
        Row mergedRow;
        mergedRow.reserve(result.totalColumns);
        bool anyData = false;

        for (int fi = 0; fi < numFiles; ++fi) {
            if (!readers[fi]->isOpen()) {
                // File exhausted - pad with empty columns
                for (int c = 0; c < fileColCounts[fi]; ++c)
                    mergedRow.append({""});
                continue;
            }

            Row row;
            if (!readers[fi]->readRow(row)) {
                readers[fi]->close();
                numActive--;
                for (int c = 0; c < fileColCounts[fi]; ++c)
                    mergedRow.append({""});
                continue;
            }

            anyData = true;
            // Pad row to expected column count
            while (row.size() < fileColCounts[fi]) row.append({""});
            for (const auto& cell : row) mergedRow.append(cell);
        }

        if (!anyData) break;

        if (result.previewData.size() < 25) result.previewData.append(mergedRow);
        writeRowToCSV(outFile, mergedRow, outSep, useGbk);
        result.totalRows++;

        // Approximate progress
        if (result.totalRows % 5000 == 0 && progress) {
            processedBytes = totalBytes; // Can't track exact bytes in column merge
            progress(99); // Will finish at 100 when done
        }
    }

    outFile.close();
    qDeleteAll(readers);
    if (progress) progress(100);
    return result;
}

// Streaming MatchHeaders: read headers first, then stream data with column remapping
MergeResult streamMatchHeaders(const QStringList& filePaths, const MergeOptions& options,
                                 QString& errorMsg, std::function<void(int)> progress) {
    MergeResult result;
    result.outputFilePath = options.outputFilePath;
    qint64 totalBytes = 0;
    for (const auto& f : filePaths) totalBytes += QFileInfo(f).size();

    int numFiles = filePaths.size();

    // Phase 1: Open all files, read headers, build global column mapping
    QVector<CsvStreamReader*> readers(numFiles, nullptr);
    QMap<QString, int> headerToIndex;
    QVector<QString> globalHeaders;
    QVector<QMap<int, int>> colMappings(numFiles);

    for (int fi = 0; fi < numFiles; ++fi) {
        readers[fi] = new CsvStreamReader();
        QString err;
        if (!readers[fi]->open(filePaths[fi], err)) {
            errorMsg = err;
            qDeleteAll(readers);
            return result;
        }
        result.mergedFiles.append(QFileInfo(filePaths[fi]).fileName());

        Row header;
        readers[fi]->readRow(header);
        for (int c = 0; c < header.size(); ++c) {
            QString h = header[c].text.trimmed();
            if (h.isEmpty()) continue;
            if (!headerToIndex.contains(h)) {
                headerToIndex[h] = globalHeaders.size();
                globalHeaders.append(h);
            }
            colMappings[fi][c] = headerToIndex[h];
        }
    }

    if (globalHeaders.isEmpty()) {
        errorMsg = "未在任何文件中找到表头";
        qDeleteAll(readers);
        return result;
    }

    int totalCols = globalHeaders.size();

    // Phase 2: Open output file, write merged header
    QFile outFile(options.outputFilePath);
    if (!outFile.open(QIODevice::WriteOnly)) {
        errorMsg = QString("无法写入文件：%1").arg(options.outputFilePath);
        qDeleteAll(readers);
        return result;
    }

    bool useGbk = (options.encoding.toUpper() == "GBK" || options.encoding.toUpper() == "GB2312");
    if (!useGbk) outFile.write("\xEF\xBB\xBF");
    QChar outSep = options.csvSeparator;

    Row headerRow;
    headerRow.reserve(totalCols);
    for (const auto& h : globalHeaders) headerRow.append({h});
    writeRowToCSV(outFile, headerRow, outSep, useGbk);
    result.totalColumns = totalCols;

    // Phase 3: Stream data rows from each file with column remapping
    qint64 processedBytes = 0;

    for (int fi = 0; fi < numFiles; ++fi) {
        Row row;
        while (readers[fi]->readRow(row)) {
            // Build output row with global column count (pre-filled empty)
            Row outRow(totalCols, {""});
            for (int c = 0; c < row.size(); ++c) {
                auto it = colMappings[fi].find(c);
                if (it != colMappings[fi].end()) {
                    outRow[it.value()] = row[c];
                }
            }

            if (result.previewData.size() < 25) result.previewData.append(outRow);
            writeRowToCSV(outFile, outRow, outSep, useGbk);
            result.totalRows++;
        }

        processedBytes += QFileInfo(filePaths[fi]).size();
        if (progress) progress(static_cast<int>(processedBytes * 100 / std::max(totalBytes, qint64(1))));
        readers[fi]->close();
    }

    outFile.close();
    qDeleteAll(readers);
    return result;
}

} // anonymous namespace

// ============================================================
// MergeEngine implementation
// ============================================================

MergeEngine::MergeEngine(QObject* parent) : QObject(parent) {}

void MergeEngine::setProgressCallback(std::function<void(int)> callback) {
    m_progressCallback = std::move(callback);
}

bool MergeEngine::isCSVFile(const QString& filePath) {
    QString suffix = QFileInfo(filePath).suffix().toLower();
    return suffix == "csv" || suffix == "tsv" || suffix == "txt";
}

bool MergeEngine::isExcelFile(const QString& filePath) {
    QString suffix = QFileInfo(filePath).suffix().toLower();
    return suffix == "xlsx" || suffix == "xls";
}

Table MergeEngine::loadFile(const QString& filePath, QString& errorMsg) {
    if (isCSVFile(filePath)) {
        return CsvParser::parseFile(filePath, errorMsg);
    } else if (isExcelFile(filePath)) {
        return ExcelParser::parseFile(filePath, errorMsg);
    } else {
        errorMsg = QString("Unsupported file format: %1").arg(filePath);
        return {};
    }
}

void MergeEngine::normalizeTableSize(Table& table, int targetCols) {
    for (int r = 0; r < table.size(); ++r) {
        while (table[r].size() < targetCols) {
            table[r].append({""});
        }
    }
}

Table MergeEngine::mergeAppendRows(const QList<Table>& tables, bool includeHeader) {
    if (tables.isEmpty()) return {};
    if (tables.size() == 1) return tables.first();

    Table result;
    // Keep header from first file
    if (includeHeader && !tables.first().isEmpty()) {
        result.append(tables.first().first());
    }

    // Find max columns
    int maxCols = 0;
    for (const auto& t : tables) {
        for (const auto& row : t) {
            maxCols = std::max(maxCols, static_cast<int>(row.size()));
        }
    }

    for (int i = 0; i < tables.size(); ++i) {
        const Table& table = tables[i];
        int startRow = (i == 0 && includeHeader) ? 1 : 0;

        for (int r = startRow; r < table.size(); ++r) {
            Row row = table[r];
            while (row.size() < maxCols) row.append({""});
            result.append(row);
        }
    }

    return result;
}

Table MergeEngine::mergeAppendColumns(const QList<Table>& tables, bool includeHeader) {
    if (tables.isEmpty()) return {};
    if (tables.size() == 1) return tables.first();

    // Find max rows
    int maxRows = 0;
    for (const auto& t : tables) {
        maxRows = std::max(maxRows, static_cast<int>(t.size()));
    }

    Table result(maxRows);

    for (int r = 0; r < maxRows; ++r) {
        for (const auto& table : tables) {
            if (table.size() > r) {
                for (const auto& cell : table[r]) {
                    result[r].append(cell);
                }
            } else {
                // Pad with empty cells
                int cols = (table.isEmpty()) ? 0 : table.first().size();
                for (int c = 0; c < cols; ++c) {
                    result[r].append({""});
                }
            }
        }
    }

    return result;
}

Table MergeEngine::mergeMatchHeaders(const QList<Table>& tables, QString& errorMsg) {
    if (tables.isEmpty()) return {};

    // Collect all unique headers from all files
    QMap<QString, int> headerToIndex;
    QVector<QString> headers;
    QStringList headerOrder;

    for (const auto& table : tables) {
        if (table.isEmpty()) continue;
        const Row& headerRow = table.first();
        for (const auto& cell : headerRow) {
            QString h = cell.text.trimmed();
            if (h.isEmpty()) continue;
            if (!headerToIndex.contains(h)) {
                headerToIndex[h] = headers.size();
                headers.append(h);
                headerOrder.append(h);
            }
        }
    }

    if (headers.isEmpty()) {
        errorMsg = "No headers found in any file";
        return {};
    }

    int totalCols = headers.size();
    Table result;
    result.append(Row());
    for (const auto& h : headers) {
        result.first().append({h});
    }

    // Merge data using header mapping
    for (int t = 0; t < tables.size(); ++t) {
        const Table& table = tables[t];
        if (table.size() < 2) continue;

        // Map file headers to global header indices
        QMap<int, int> colMapping;
        const Row& fileHeader = table.first();
        for (int c = 0; c < fileHeader.size(); ++c) {
            QString h = fileHeader[c].text.trimmed();
            if (headerToIndex.contains(h)) {
                colMapping[c] = headerToIndex[h];
            }
        }

        // Add data rows
        for (int r = 1; r < table.size(); ++r) {
            Row row(totalCols, {""});
            for (int c = 0; c < table[r].size(); ++c) {
                if (colMapping.contains(c)) {
                    row[colMapping[c]] = table[r][c];
                }
            }
            result.append(row);
        }
    }

    return result;
}

MergeResult MergeEngine::merge(const QStringList& filePaths, const MergeOptions& options, QString& errorMsg) {
    return mergeDirect(filePaths, options, errorMsg);
}

MergeResult MergeEngine::mergeDirect(const QStringList& filePaths, const MergeOptions& options, QString& errorMsg) {
    MergeResult result;
    if (filePaths.isEmpty()) {
        errorMsg = "No files selected";
        return result;
    }

    // Load all files
    QList<Table> tables;
    for (const auto& path : filePaths) {
        Table table = loadFile(path, errorMsg);
        if (!errorMsg.isEmpty()) {
            return result;
        }

        if (options.skipFirstNRows > 0) {
            table = table.mid(options.skipFirstNRows);
        }

        tables.append(table);
        result.mergedFiles.append(QFileInfo(path).fileName());
    }

    // Perform merge based on mode
    switch (options.mode) {
        case MergeMode::AppendRows:
            result.data = mergeAppendRows(tables, options.includeHeader);
            break;
        case MergeMode::AppendColumns:
            result.data = mergeAppendColumns(tables, options.includeHeader);
            break;
        case MergeMode::MatchHeaders:
            result.data = mergeMatchHeaders(tables, errorMsg);
            if (!errorMsg.isEmpty()) return result;
            break;
    }

    result.totalRows = result.data.size();
    result.totalColumns = result.data.isEmpty() ? 0 : result.data.first().size();
    result.previewData = result.data.mid(0, 25);

    return result;
}

// ============================================================
// Streaming merge (constant memory) - recommended for CSV files
// ============================================================
MergeResult MergeEngine::mergeStreamCSV(const QStringList& filePaths, const MergeOptions& options,
                                         QString& errorMsg, std::function<void(int)> progress) {
    // If any file is Excel (.xlsx/.xls), fall back to in-memory merge
    for (const auto& f : filePaths) {
        if (isExcelFile(f)) {
            MergeResult result = mergeDirect(filePaths, options, errorMsg);
            if (!errorMsg.isEmpty() && result.data.isEmpty()) return result;

            // Save to file and free the full data from memory
            if (!result.data.isEmpty()) {
                QString saveErr;
                if (options.format == OutputFormat::CSV) {
                    if (!saveToCSVStatic(result.data, options.outputFilePath, options, saveErr)) {
                        errorMsg = saveErr;
                        return result;
                    }
                    result.outputFilePath = options.outputFilePath;
                } else {
                    errorMsg = "XLSX 输出尚未实现，请使用 CSV 格式";
                    return result;
                }
                result.previewData = result.data.mid(0, 25);
                result.data.clear(); // Release memory immediately
                result.data.squeeze(); // Shrink allocation
            }
            return result;
        }
    }

    // All CSV files → streaming merge (constant memory)
    switch (options.mode) {
        case MergeMode::AppendRows:
            return streamAppendRows(filePaths, options, errorMsg, progress);
        case MergeMode::AppendColumns:
            return streamAppendColumns(filePaths, options, errorMsg, progress);
        case MergeMode::MatchHeaders:
            return streamMatchHeaders(filePaths, options, errorMsg, progress);
    }

    errorMsg = "未知的合并模式";
    return {};
}

bool MergeEngine::saveToCSV(const Table& data, const QString& filePath, const MergeOptions& options, QString& errorMsg) {
    return saveToCSVStatic(data, filePath, options, errorMsg);
}

bool MergeEngine::saveToCSVStatic(const Table& data, const QString& filePath, const MergeOptions& options, QString& errorMsg) {
    if (data.isEmpty()) {
        errorMsg = "No data to save";
        return false;
    }

    QFile file(filePath);
    if (!file.open(QIODevice::WriteOnly)) {
        errorMsg = QString("Cannot write to file: %1").arg(filePath);
        return false;
    }

    // Write BOM for UTF-8 CSV (helps Excel recognize encoding)
    if (options.encoding.toUpper() == "UTF-8") {
        file.write("\xEF\xBB\xBF");
    }

    // Use QByteArray for encoding conversion
    bool useGbk = (options.encoding.toUpper() == "GBK" || options.encoding.toUpper() == "GB2312");
    QChar sep = options.csvSeparator;

    for (int r = 0; r < data.size(); ++r) {
        QByteArray line;
        for (int c = 0; c < data[r].size(); ++c) {
            if (c > 0) {
                line += sep.toLatin1();
            }
            QString field = data[r][c].text;
            // Escape if contains separator, quote, or newline
            if (field.contains(sep) || field.contains('"') || field.contains('\n') || field.contains('\r')) {
                field.replace('"', "\"\"");
                field = "\"" + field + "\"";
            }
            if (useGbk) {
                line += field.toLocal8Bit();
            } else {
                line += field.toUtf8();
            }
        }
        line += "\n";
        file.write(line);
    }

    file.close();
    return true;
}

bool MergeEngine::saveToXLSX(const Table& data, const QString& filePath, const MergeOptions& /*options*/, QString& errorMsg) {
    Q_UNUSED(data);
    Q_UNUSED(filePath);
    errorMsg = "XLSX output is not yet implemented. Please use CSV output.";
    return false;
}
