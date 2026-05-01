#include "ExcelParser.h"
#include <QFile>
#include <QDir>
#include <QTemporaryDir>
#include <QProcess>
#include <QXmlStreamReader>
#include <QDebug>

// XLSX is a ZIP file containing XML. We use the system's unzip (from MSYS2)
// or Qt's built-in capabilities

Table ExcelParser::parseSheetXml(const QByteArray& xmlData) {
    Table table;
    QXmlStreamReader xml(xmlData);

    bool inRow = false;
    bool inCell = false;
    bool inValue = false;
    bool inInlineStr = false;
    bool inSharedString = false;
    bool inRichText = false;

    QString currentRef;
    QString currentValue;
    QString cellType;
    Row currentRow;

    // For shared strings - we'll parse inline strings only for simplicity
    // A full implementation would first parse xl/sharedStrings.xml

    while (!xml.atEnd()) {
        xml.readNext();

        if (xml.isStartElement()) {
            QString name = xml.name().toString();

            if (name == "row") {
                inRow = true;
                currentRow.clear();
            } else if (name == "c") {
                inCell = true;
                currentRef = xml.attributes().value("r").toString();
                cellType = xml.attributes().value("t").toString();
                currentValue.clear();
            } else if (name == "v") {
                inValue = true;
            } else if (name == "is") {
                inInlineStr = true;
            } else if (name == "t") {
                inRichText = true;
            }
        } else if (xml.isCharacters()) {
            if (inValue || inRichText) {
                currentValue += xml.text().toString();
            }
        } else if (xml.isEndElement()) {
            QString name = xml.name().toString();

            if (name == "v") {
                inValue = false;
            } else if (name == "t") {
                inRichText = false;
            } else if (name == "is") {
                inInlineStr = false;
            } else if (name == "c") {
                inCell = false;
                // Convert cell reference to column index
                // e.g., "A1" -> 0, "B1" -> 1, "AA1" -> 26
                QString colStr;
                for (QChar ch : currentRef) {
                    if (ch.isLetter()) colStr += ch;
                    else break;
                }
                int colIndex = 0;
                for (QChar ch : colStr) {
                    colIndex = colIndex * 26 + (ch.toUpper().toLatin1() - 'A' + 1) - 1;
                }

                // Pad with empty cells if needed
                while (currentRow.size() <= colIndex) {
                    currentRow.append({""});
                }
                currentRow[colIndex] = {currentValue};
            } else if (name == "row") {
                inRow = false;
                if (!currentRow.isEmpty()) {
                    table.append(currentRow);
                }
            }
        }
    }

    return table;
}

bool ExcelParser::extractAndParse(const QString& xlsxPath, Table& table, QString& errorMsg) {
    // XLSX files are ZIP archives. We use PowerShell to extract.
    QTemporaryDir tempDir;
    if (!tempDir.isValid()) {
        errorMsg = "Failed to create temporary directory";
        return false;
    }

    // Extract using PowerShell
    QProcess proc;
    proc.setProgram("powershell");
    proc.setArguments({
        "-Command",
        QString("Expand-Archive -Path '%1' -DestinationPath '%2' -Force")
            .arg(QDir::toNativeSeparators(xlsxPath))
            .arg(QDir::toNativeSeparators(tempDir.path()))
    });
    proc.start();
    if (!proc.waitForFinished(30000)) {
        errorMsg = "Timeout extracting XLSX file";
        return false;
    }
    if (proc.exitCode() != 0) {
        errorMsg = QString("Failed to extract: %1").arg(QString::fromLocal8Bit(proc.readAllStandardError()));
        return false;
    }

    // Read xl/worksheets/sheet1.xml (or find the first sheet)
    QString sheetPath = tempDir.path() + "/xl/worksheets/sheet1.xml";
    if (!QFile::exists(sheetPath)) {
        // Try to find any sheet file
        QDir wsDir(tempDir.path() + "/xl/worksheets");
        QStringList sheets = wsDir.entryList({"sheet*.xml"}, QDir::Files, QDir::Name);
        if (sheets.isEmpty()) {
            errorMsg = "No worksheet found in XLSX file";
            return false;
        }
        sheetPath = wsDir.absoluteFilePath(sheets.first());
    }

    QFile sheetFile(sheetPath);
    if (!sheetFile.open(QIODevice::ReadOnly)) {
        errorMsg = "Cannot read worksheet XML";
        return false;
    }
    QByteArray xmlData = sheetFile.readAll();
    sheetFile.close();

    // Parse shared strings first if available
    QString sharedStringsPath = tempDir.path() + "/xl/sharedStrings.xml";
    QVector<QString> sharedStrings;
    if (QFile::exists(sharedStringsPath)) {
        QFile ssFile(sharedStringsPath);
        if (ssFile.open(QIODevice::ReadOnly)) {
            QXmlStreamReader ssXml(ssFile.readAll());
            bool inT = false;
            while (!ssXml.atEnd()) {
                ssXml.readNext();
                if (ssXml.isStartElement() && ssXml.name() == "t") {
                    inT = true;
                } else if (ssXml.isCharacters() && inT) {
                    sharedStrings.append(ssXml.text().toString());
                } else if (ssXml.isEndElement() && ssXml.name() == "t") {
                    inT = false;
                }
            }
        }
    }

    table = parseSheetXml(xmlData);

    // Resolve shared string references
    if (!sharedStrings.isEmpty()) {
        for (int r = 0; r < table.size(); ++r) {
            for (int c = 0; c < table[r].size(); ++c) {
                bool ok;
                int idx = table[r][c].text.toInt(&ok);
                if (ok && idx >= 0 && idx < sharedStrings.size()) {
                    table[r][c].text = sharedStrings[idx];
                }
            }
        }
    }

    return true;
}

Table ExcelParser::parseFile(const QString& filePath, QString& errorMsg) {
    if (!QFile::exists(filePath)) {
        errorMsg = QString("File not found: %1").arg(filePath);
        return {};
    }

    if (!filePath.endsWith(".xlsx", Qt::CaseInsensitive) &&
        !filePath.endsWith(".xls", Qt::CaseInsensitive)) {
        errorMsg = "Not an Excel file (.xlsx/.xls)";
        return {};
    }

    Table table;
    if (!extractAndParse(filePath, table, errorMsg)) {
        return {};
    }

    return table;
}

QStringList ExcelParser::getSheetNames(const QString& filePath, QString& errorMsg) {
    // For simplicity, return the first sheet
    // A full implementation would parse xl/workbook.xml
    Q_UNUSED(filePath);
    Q_UNUSED(errorMsg);
    return {"Sheet1"};
}
