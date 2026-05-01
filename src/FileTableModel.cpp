#include "FileTableModel.h"

FileTableModel::FileTableModel(QObject* parent) : QAbstractTableModel(parent) {}

void FileTableModel::setTable(const Table& data) {
    beginResetModel();
    m_data = data;
    endResetModel();
}

int FileTableModel::rowCount(const QModelIndex& /*parent*/) const {
    return std::min(static_cast<int>(m_data.size()), m_maxPreviewRows);
}

int FileTableModel::columnCount(const QModelIndex& /*parent*/) const {
    if (m_data.isEmpty()) return 0;
    int maxCols = 0;
    for (const auto& row : m_data) {
        maxCols = std::max(maxCols, static_cast<int>(row.size()));
    }
    return maxCols;
}

QVariant FileTableModel::data(const QModelIndex& index, int role) const {
    if (!index.isValid() || role != Qt::DisplayRole) return {};

    int row = index.row();
    int col = index.column();

    if (row >= m_data.size()) return {};

    if (col >= m_data[row].size()) return {};

    return m_data[row][col].text;
}

QVariant FileTableModel::headerData(int section, Qt::Orientation orientation, int role) const {
    if (role != Qt::DisplayRole) return {};

    if (orientation == Qt::Vertical) {
        return QString::number(section + 1);
    }

    // Column headers: A, B, C, ...
    QString header;
    int n = section;
    do {
        header = QChar('A' + (n % 26)) + header;
        n /= 26;
    } while (n > 0);
    return header;
}
