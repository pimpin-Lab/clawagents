#pragma once

#include "CsvParser.h"
#include <QString>
#include <QObject>
#include <functional>

enum class MergeMode {
    AppendRows,    // Append rows from all files (vertical merge)
    AppendColumns, // Append columns side by side (horizontal merge)
    MatchHeaders   // Match columns by header names (smart merge)
};

enum class OutputFormat {
    CSV,
    XLSX
};

struct MergeResult {
    Table data;              // Full data (only set by legacy mergeDirect, used as Excel fallback)
    Table previewData;       // First 25 rows for preview display
    int totalRows = 0;
    int totalColumns = 0;
    QStringList mergedFiles;
    QString outputFilePath;  // Where file was saved (set by streaming merge)
};

struct MergeOptions {
    MergeMode mode = MergeMode::AppendRows;
    OutputFormat format = OutputFormat::CSV;
    QString outputFilePath;
    bool skipDuplicates = false;
    bool includeHeader = true;
    int skipFirstNRows = 0;
    QChar csvSeparator = ',';
    QString encoding = "UTF-8";
};

class MergeEngine : public QObject {
    Q_OBJECT
public:
    explicit MergeEngine(QObject* parent = nullptr);

    void setProgressCallback(std::function<void(int)> callback);

    // Main merge operation (with progress callback via signal)
    MergeResult merge(const QStringList& filePaths, const MergeOptions& options, QString& errorMsg);

    // Static version for use in worker thread (legacy, loads all into memory)
    static MergeResult mergeDirect(const QStringList& filePaths, const MergeOptions& options, QString& errorMsg);

    // Streaming merge - constant memory, writes directly to file (recommended for CSV)
    static MergeResult mergeStreamCSV(const QStringList& filePaths, const MergeOptions& options,
                                       QString& errorMsg, std::function<void(int)> progress = {});

    // Save merged data to file
    bool saveToCSV(const Table& data, const QString& filePath, const MergeOptions& options, QString& errorMsg);

    // Static save for worker thread
    static bool saveToCSVStatic(const Table& data, const QString& filePath, const MergeOptions& options, QString& errorMsg);

    bool saveToXLSX(const Table& data, const QString& filePath, const MergeOptions& options, QString& errorMsg);

    // File type detection
    static bool isCSVFile(const QString& filePath);
    static bool isExcelFile(const QString& filePath);

private:
    static Table loadFile(const QString& filePath, QString& errorMsg);
    static Table mergeAppendRows(const QList<Table>& tables, bool includeHeader);
    static Table mergeAppendColumns(const QList<Table>& tables, bool includeHeader);
    static Table mergeMatchHeaders(const QList<Table>& tables, QString& errorMsg);
    static void normalizeTableSize(Table& table, int targetCols);

    std::function<void(int)> m_progressCallback;
};
