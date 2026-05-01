#pragma once

#include <QMainWindow>
#include <QListWidget>
#include <QTableView>
#include <QComboBox>
#include <QProgressBar>
#include <QLabel>
#include <QPushButton>
#include <QLineEdit>
#include <QCheckBox>
#include <QTextEdit>
#include <QThread>
#include "FileTableModel.h"
#include "MergeEngine.h"

class MergeWorker : public QObject {
    Q_OBJECT
public:
    QStringList filePaths;
    MergeOptions options;

public slots:
    void doWork() {
        QString errorMsg;
        MergeResult result = MergeEngine::mergeStreamCSV(filePaths, options, errorMsg,
            [this](int pct) { emit progressUpdate(pct); });
        emit finished(result, errorMsg);
    }

signals:
    void finished(const MergeResult& result, const QString& errorMsg);
    void progressUpdate(int percent);
};

class MainWindow : public QMainWindow {
    Q_OBJECT
public:
    explicit MainWindow(QWidget* parent = nullptr);
    ~MainWindow();

signals:
    void startMergeWork();

private slots:
    void onAddFiles();
    void onRemoveFile();
    void onClearFiles();
    void onFileSelectionChanged();
    void handleMergeButton();
    void onBrowseOutput();
    void onMergeModeChanged(int index);
    void onMergeFinished(const MergeResult& result, const QString& errorMsg);

private:
    void setupUI();
    void setupMenuBar();
    void showDonateDialog();
    void loadFilePreview(const QString& filePath);
    void updateFileCount();
    QString formatFileSize(qint64 bytes);

    // UI Elements
    QListWidget* m_fileList = nullptr;
    QTableView* m_previewTable = nullptr;
    FileTableModel* m_tableModel = nullptr;
    QComboBox* m_mergeModeCombo = nullptr;
    QComboBox* m_outputFormatCombo = nullptr;
    QComboBox* m_encodingCombo = nullptr;
    QComboBox* m_separatorCombo = nullptr;
    QLineEdit* m_outputPathEdit = nullptr;
    QProgressBar* m_progressBar = nullptr;
    QLabel* m_statusLabel = nullptr;
    QLabel* m_fileCountLabel = nullptr;
    QLabel* m_previewInfoLabel = nullptr;
    QTextEdit* m_logEdit = nullptr;
    QCheckBox* m_skipDuplicatesCheck = nullptr;
    QCheckBox* m_includeHeaderCheck = nullptr;
    QPushButton* m_mergeButton = nullptr;
    QPushButton* m_addButton = nullptr;
    QPushButton* m_removeButton = nullptr;
    QPushButton* m_clearButton = nullptr;
    QPushButton* m_browseButton = nullptr;

    // Core engine
    MergeEngine* m_mergeEngine = nullptr;

    // Async merge
    QThread* m_mergeThread = nullptr;
    MergeWorker* m_mergeWorker = nullptr;

    // Data cache for preview
    QMap<QString, Table> m_fileDataCache;
};
