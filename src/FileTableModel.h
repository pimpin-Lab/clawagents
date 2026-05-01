#pragma once

#include <QAbstractTableModel>
#include "CsvParser.h"

// Custom model for displaying file data in a QTableView
class FileTableModel : public QAbstractTableModel {
    Q_OBJECT
public:
    explicit FileTableModel(QObject* parent = nullptr);

    void setTable(const Table& data);
    const Table& table() const { return m_data; }

    // QAbstractTableModel interface
    int rowCount(const QModelIndex& parent = QModelIndex()) const override;
    int columnCount(const QModelIndex& parent = QModelIndex()) const override;
    QVariant data(const QModelIndex& index, int role = Qt::DisplayRole) const override;
    QVariant headerData(int section, Qt::Orientation orientation, int role = Qt::DisplayRole) const override;

    void setMaxPreviewRows(int rows) { m_maxPreviewRows = rows; }

private:
    Table m_data;
    int m_maxPreviewRows = 20;
};
