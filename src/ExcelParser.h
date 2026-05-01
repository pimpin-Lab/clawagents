#pragma once

#include "CsvParser.h"
#include <QString>
#include <QVector>

// Simple XLSX parser using minizip + custom XML parsing
// For production, consider using xlnt or OpenXLSX library
class ExcelParser {
public:
    // Parse an Excel .xlsx file and return the data as a Table
    static Table parseFile(const QString& filePath, QString& errorMsg);

    // Get sheet names
    static QStringList getSheetNames(const QString& filePath, QString& errorMsg);

private:
    static bool extractAndParse(const QString& xlsxPath, Table& table, QString& errorMsg);
    static Table parseSheetXml(const QByteArray& xmlData);
};
