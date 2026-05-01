#include "MainWindow.h"
#include "ExcelParser.h"
#include "CsvParser.h"
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QSplitter>
#include <QGroupBox>
#include <QFileDialog>
#include <QMessageBox>
#include <QFileInfo>
#include <QDateTime>
#include <QMenuBar>
#include <QHeaderView>
#include <QStatusBar>
#include <QTimer>
#include <QMenu>
#include <QApplication>
#include <QDragEnterEvent>
#include <QMimeData>
#include <QStandardPaths>
#include <QFontDatabase>
#include <QDialog>
#include <QPixmap>
#include <QLabel>
#include <algorithm>

class FileListWidget : public QListWidget {
public:
    explicit FileListWidget(QWidget* parent = nullptr) : QListWidget(parent) {
        setAcceptDrops(true);
    }
    std::function<void(const QStringList&)> onFilesDropped;
protected:
    void dragEnterEvent(QDragEnterEvent* event) override {
        if (event->mimeData()->hasUrls()) {
            event->acceptProposedAction();
        }
    }
    void dragMoveEvent(QDragMoveEvent* event) override {
        event->acceptProposedAction();
    }
    void dropEvent(QDropEvent* event) override {
        QList<QUrl> urls = event->mimeData()->urls();
        QStringList files;
        for (const auto& url : urls) {
            QString path = url.toLocalFile();
            if (!path.isEmpty()) files.append(path);
        }
        if (!files.isEmpty() && onFilesDropped) {
            onFilesDropped(files);
        }
    }
};

MainWindow::MainWindow(QWidget* parent) : QMainWindow(parent) {
    setupUI();
    setupMenuBar();

    m_mergeEngine = new MergeEngine(this);
    setWindowTitle("Excel/CSV Merger - Excel/CSV 文件合并工具");
    setMinimumSize(900, 600);
    resize(1100, 700);

    // Load a nice font
    QFont font("Microsoft YaHei", 9);
    QApplication::setFont(font);

    m_logEdit->append(tr("<span style='color:#666;'>就绪。添加 CSV 或 Excel 文件开始使用。</span>"));

    // Setup async merge thread
    m_mergeThread = new QThread(this);
    m_mergeWorker = new MergeWorker();
    m_mergeWorker->moveToThread(m_mergeThread);
    connect(m_mergeThread, &QThread::finished, m_mergeWorker, &QObject::deleteLater);
    connect(this, &MainWindow::startMergeWork, m_mergeWorker, &MergeWorker::doWork);
    connect(m_mergeWorker, &MergeWorker::progressUpdate, this, [this](int pct) {
        m_progressBar->setValue(std::min(pct, 100));
        m_statusLabel->setText(tr("正在合并... %1%").arg(pct));
    });
    connect(m_mergeWorker, &MergeWorker::finished, this, &MainWindow::onMergeFinished);
    m_mergeThread->start();
}

MainWindow::~MainWindow() {
    m_mergeThread->quit();
    m_mergeThread->wait();
}

void MainWindow::setupMenuBar() {
    QMenuBar* menuBar = this->menuBar();

    QMenu* fileMenu = menuBar->addMenu(tr("File(&F)"));
    QAction* addFilesAction = fileMenu->addAction(tr("添加文件..."));
    connect(addFilesAction, &QAction::triggered, this, &MainWindow::onAddFiles);
    QAction* exitAction = fileMenu->addSeparator();
    fileMenu->addAction(tr("退出"));
    connect(exitAction, &QAction::triggered, this, &QMainWindow::close);

    QMenu* helpMenu = menuBar->addMenu(tr("Help(&H)"));
    QAction* aboutAction = helpMenu->addAction(tr("关于"));
    connect(aboutAction, &QAction::triggered, [this]() {
        QMessageBox::about(this, tr("关于"),
            tr("<h2>Excel/CSV 合并工具</h2>"
               "<p>版本 1.1.0</p>"
               "<p>一个简单易用的 Excel (.xlsx) 和 CSV 文件合并工具。</p>"
               "<p>支持以下合并模式：</p>"
               "<ul>"
               "<li>纵向合并（追加行）</li>"
               "<li>横向合并（追加列）</li>"
               "<li>智能合并（按表头匹配）</li>"
               "</ul>"));
    });

    QAction* donateAction = helpMenu->addAction(tr("赞助开发者"));
    connect(donateAction, &QAction::triggered, this, &MainWindow::showDonateDialog);
}

void MainWindow::setupUI() {
    // Central widget with main layout
    QWidget* centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);
    QVBoxLayout* mainLayout = new QVBoxLayout(centralWidget);
    mainLayout->setSpacing(8);
    mainLayout->setContentsMargins(12, 12, 12, 12);

    // === Top section: File list + Preview ===
    QSplitter* topSplitter = new QSplitter(Qt::Horizontal);

    // --- Left panel: File list ---
    QGroupBox* fileGroup = new QGroupBox(tr("文件列表（待合并文件）"));
    QVBoxLayout* fileLayout = new QVBoxLayout(fileGroup);

    m_fileList = new FileListWidget();
    m_fileList->setSelectionMode(QAbstractItemView::ExtendedSelection);
    connect(m_fileList, &QListWidget::currentItemChanged, this, &MainWindow::onFileSelectionChanged);
    static_cast<FileListWidget*>(m_fileList)->onFilesDropped = [this](const QStringList& files) {
        for (const auto& f : files) {
            if (MergeEngine::isCSVFile(f) || MergeEngine::isExcelFile(f)) {
                m_fileList->addItem(f);
            }
        }
        updateFileCount();
    };
    fileLayout->addWidget(m_fileList);

    // File buttons
    QHBoxLayout* fileBtnLayout = new QHBoxLayout();
    m_addButton = new QPushButton(tr("添加文件..."));
    m_removeButton = new QPushButton(tr("移除"));
    m_clearButton = new QPushButton(tr("清空全部"));

    connect(m_addButton, &QPushButton::clicked, this, &MainWindow::onAddFiles);
    connect(m_removeButton, &QPushButton::clicked, this, &MainWindow::onRemoveFile);
    connect(m_clearButton, &QPushButton::clicked, this, &MainWindow::onClearFiles);

    fileBtnLayout->addWidget(m_addButton);
    fileBtnLayout->addWidget(m_removeButton);
    fileBtnLayout->addWidget(m_clearButton);
    fileLayout->addLayout(fileBtnLayout);

    m_fileCountLabel = new QLabel(tr("0 个文件"));
    m_fileCountLabel->setStyleSheet("color: #888; font-size: 11px;");
    fileLayout->addWidget(m_fileCountLabel);

    topSplitter->addWidget(fileGroup);

    // --- Right panel: Preview ---
    QGroupBox* previewGroup = new QGroupBox(tr("数据预览"));
    QVBoxLayout* previewLayout = new QVBoxLayout(previewGroup);

    m_previewInfoLabel = new QLabel(tr("选择文件以预览"));
    m_previewInfoLabel->setStyleSheet("color: #888; font-size: 11px;");

    m_previewTable = new QTableView();
    m_previewTable->setSelectionBehavior(QAbstractItemView::SelectItems);
    m_previewTable->setEditTriggers(QAbstractItemView::NoEditTriggers);
    m_previewTable->setAlternatingRowColors(true);
    m_previewTable->setSortingEnabled(false);
    m_previewTable->horizontalHeader()->setStretchLastSection(true);
    m_previewTable->verticalHeader()->setDefaultSectionSize(24);

    m_tableModel = new FileTableModel(this);
    m_previewTable->setModel(m_tableModel);

    previewLayout->addWidget(m_previewInfoLabel);
    previewLayout->addWidget(m_previewTable);

    topSplitter->addWidget(previewGroup);
    topSplitter->setStretchFactor(0, 1);
    topSplitter->setStretchFactor(1, 2);

    mainLayout->addWidget(topSplitter, 1);

    // === Middle section: Merge options ===
    QGroupBox* optionsGroup = new QGroupBox(tr("合并选项"));
    QHBoxLayout* optionsLayout = new QHBoxLayout(optionsGroup);
    optionsLayout->setSpacing(16);

    // Merge mode
    optionsLayout->addWidget(new QLabel(tr("合并模式：")));
    m_mergeModeCombo = new QComboBox();
    m_mergeModeCombo->addItem(tr("追加行（纵向合并）"), static_cast<int>(MergeMode::AppendRows));
    m_mergeModeCombo->addItem(tr("追加列（横向合并）"), static_cast<int>(MergeMode::AppendColumns));
    m_mergeModeCombo->addItem(tr("匹配表头（智能合并）"), static_cast<int>(MergeMode::MatchHeaders));
    connect(m_mergeModeCombo, QOverload<int>::of(&QComboBox::currentIndexChanged),
            this, &MainWindow::onMergeModeChanged);
    optionsLayout->addWidget(m_mergeModeCombo);

    // Separator
    optionsLayout->addWidget(new QLabel(tr("  分隔符：")));
    m_separatorCombo = new QComboBox();
    m_separatorCombo->addItem(tr("逗号 (,)"), ',');
    m_separatorCombo->addItem(tr("制表符 (\\t)"), '\t');
    m_separatorCombo->addItem(tr("分号 (;)"), ';');
    m_separatorCombo->addItem(tr("竖线 (|)"), '|');
    optionsLayout->addWidget(m_separatorCombo);

    // Encoding
    optionsLayout->addWidget(new QLabel(tr("  编码：")));
    m_encodingCombo = new QComboBox();
    m_encodingCombo->addItem("UTF-8", "UTF-8");
    m_encodingCombo->addItem("GBK/GB2312", "GBK");
    optionsLayout->addWidget(m_encodingCombo);

    // Include header
    m_includeHeaderCheck = new QCheckBox(tr("首行为表头"));
    m_includeHeaderCheck->setChecked(true);
    optionsLayout->addWidget(m_includeHeaderCheck);

    m_skipDuplicatesCheck = new QCheckBox(tr("跳过重复项"));
    optionsLayout->addWidget(m_skipDuplicatesCheck);

    optionsLayout->addStretch();

    mainLayout->addWidget(optionsGroup);

    // === Bottom section: Output path + Merge button ===
    QHBoxLayout* bottomLayout = new QHBoxLayout();

    bottomLayout->addWidget(new QLabel(tr("输出：")));

    m_outputPathEdit = new QLineEdit();
    m_outputPathEdit->setPlaceholderText(tr("选择输出文件路径..."));
    bottomLayout->addWidget(m_outputPathEdit, 1);

    m_outputFormatCombo = new QComboBox();
    m_outputFormatCombo->addItem("CSV", static_cast<int>(OutputFormat::CSV));
    m_outputFormatCombo->addItem("XLSX", static_cast<int>(OutputFormat::XLSX));
    m_outputFormatCombo->setEnabled(false); // Only CSV supported for now
    bottomLayout->addWidget(m_outputFormatCombo);

    m_browseButton = new QPushButton(tr("浏览..."));
    connect(m_browseButton, &QPushButton::clicked, this, &MainWindow::onBrowseOutput);
    bottomLayout->addWidget(m_browseButton);

    m_mergeButton = new QPushButton(tr("合并文件"));
    m_mergeButton->setMinimumWidth(120);
    m_mergeButton->setStyleSheet(
        "QPushButton {"
        "  background-color: #4CAF50; color: white; font-weight: bold; font-size: 13px;"
        "  border: none; border-radius: 4px; padding: 8px 16px;"
        "}"
        "QPushButton:hover { background-color: #45a049; }"
        "QPushButton:pressed { background-color: #3d8b40; }"
        "QPushButton:disabled { background-color: #cccccc; color: #666; }"
    );
    connect(m_mergeButton, &QPushButton::clicked, this, &MainWindow::handleMergeButton);
    bottomLayout->addWidget(m_mergeButton);

    mainLayout->addLayout(bottomLayout);

    // === Progress bar ===
    m_progressBar = new QProgressBar();
    m_progressBar->setRange(0, 100);
    m_progressBar->setValue(0);
    m_progressBar->setTextVisible(true);
    m_progressBar->setStyleSheet(
        "QProgressBar { border: 1px solid #ddd; border-radius: 4px; text-align: center; height: 20px; }"
        "QProgressBar::chunk { background-color: #4CAF50; border-radius: 3px; }"
    );
    m_progressBar->setVisible(false);
    mainLayout->addWidget(m_progressBar);

    // === Log area ===
    QGroupBox* logGroup = new QGroupBox(tr("日志"));
    QVBoxLayout* logLayout = new QVBoxLayout(logGroup);
    m_logEdit = new QTextEdit();
    m_logEdit->setReadOnly(true);
    m_logEdit->setMaximumHeight(100);
    m_logEdit->setStyleSheet("font-family: Consolas, monospace; font-size: 11px; background: #fafafa;");
    logLayout->addWidget(m_logEdit);
    mainLayout->addWidget(logGroup);

    // Status bar
    m_statusLabel = new QLabel(tr("就绪"));
    statusBar()->addWidget(m_statusLabel, 1);
}

void MainWindow::onAddFiles() {
    QStringList files = QFileDialog::getOpenFileNames(
        this, tr("选择要合并的文件"),
        QStandardPaths::writableLocation(QStandardPaths::DesktopLocation),
        tr("数据文件 (*.csv *.tsv *.txt *.xlsx *.xls);;CSV 文件 (*.csv *.tsv *.txt);;Excel 文件 (*.xlsx *.xls);;所有文件 (*)")
    );

    if (files.isEmpty()) return;

    for (const auto& file : files) {
        // Avoid duplicates
        bool exists = false;
        for (int i = 0; i < m_fileList->count(); ++i) {
            if (m_fileList->item(i)->text() == file) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            m_fileList->addItem(file);
        }
    }

    updateFileCount();
    m_logEdit->append(tr("<span style='color:#2196F3;'>已添加 %1 个文件</span>").arg(files.size()));

    // Auto-select the first file for preview
    if (m_fileList->count() > 0 && !m_fileList->currentItem()) {
        m_fileList->setCurrentRow(0);
    }
}

void MainWindow::onRemoveFile() {
    QList<QListWidgetItem*> selected = m_fileList->selectedItems();
    for (auto* item : selected) {
        m_fileDataCache.remove(item->text());
        delete item;
    }
    updateFileCount();
}

void MainWindow::onClearFiles() {
    m_fileList->clear();
    m_fileDataCache.clear();
    m_tableModel->setTable({});
    m_previewInfoLabel->setText(tr("选择文件以预览"));
    updateFileCount();
    m_logEdit->append(tr("<span style='color:#FF9800;'>已清空所有文件</span>"));
}

void MainWindow::onFileSelectionChanged() {
    QListWidgetItem* current = m_fileList->currentItem();
    if (!current) return;

    loadFilePreview(current->text());
}

void MainWindow::loadFilePreview(const QString& filePath) {
    QFileInfo fi(filePath);

    // Use lightweight preview parser (reads only ~64KB, fast even for 200MB files)
    if (MergeEngine::isCSVFile(filePath)) {
        QString errorMsg;
        Table data = CsvParser::parseFilePreview(filePath, errorMsg, 25);
        if (!errorMsg.isEmpty()) {
            m_previewInfoLabel->setText(tr("错误：%1").arg(errorMsg));
            m_logEdit->append(tr("<span style='color:red;'>加载 %1 时出错：%2</span>").arg(fi.fileName(), errorMsg));
            return;
        }
        m_fileDataCache[filePath] = data;
        m_tableModel->setTable(data);
        int rows = data.size();
        int cols = rows > 0 ? data.first().size() : 0;
        m_previewInfoLabel->setText(
            tr("%1 | %2 | 预览 %3 行 x %4 列")
                .arg(fi.fileName())
                .arg(formatFileSize(fi.size()))
                .arg(rows)
                .arg(cols)
        );
    } else if (MergeEngine::isExcelFile(filePath)) {
        // Excel files need full parse but are usually much smaller
        if (m_fileDataCache.contains(filePath)) {
            Table& cached = m_fileDataCache[filePath];
            // Trim cache to 25 rows for preview display
            Table preview = cached.mid(0, 25);
            m_tableModel->setTable(preview);
            int rows = cached.size();
            int cols = rows > 0 ? cached.first().size() : 0;
            m_previewInfoLabel->setText(
                tr("%1 | %2 | 共 %3 行 x %4 列（预览前 25 行）")
                    .arg(fi.fileName())
                    .arg(formatFileSize(fi.size()))
                    .arg(rows)
                    .arg(cols)
            );
            return;
        }

        m_previewInfoLabel->setText(tr("加载中：%1").arg(fi.fileName()));
        QApplication::processEvents();

        QString errorMsg;
        Table data = ExcelParser::parseFile(filePath, errorMsg);
        if (!errorMsg.isEmpty()) {
            m_previewInfoLabel->setText(tr("错误：%1").arg(errorMsg));
            m_logEdit->append(tr("<span style='color:red;'>加载 %1 时出错：%2</span>").arg(fi.fileName(), errorMsg));
            return;
        }
        m_fileDataCache[filePath] = data;
        Table preview = data.mid(0, 25);
        m_tableModel->setTable(preview);
        int rows = data.size();
        int cols = rows > 0 ? data.first().size() : 0;
        m_previewInfoLabel->setText(
            tr("%1 | %2 | 共 %3 行 x %4 列（预览前 25 行）")
                .arg(fi.fileName())
                .arg(formatFileSize(fi.size()))
                .arg(rows)
                .arg(cols)
        );
    }
}

void MainWindow::onBrowseOutput() {
    QString format = m_outputFormatCombo->currentData().toInt() == static_cast<int>(OutputFormat::CSV)
        ? "CSV 文件 (*.csv)" : "Excel 文件 (*.xlsx)";

    QString filePath = QFileDialog::getSaveFileName(
        this, tr("选择输出文件"),
        QStandardPaths::writableLocation(QStandardPaths::DesktopLocation) + "/merged_output.csv",
        tr("%1;;所有文件 (*)").arg(format)
    );

    if (!filePath.isEmpty()) {
        m_outputPathEdit->setText(filePath);
    }
}

void MainWindow::onMergeModeChanged(int /*index*/) {
    // Can adjust UI based on mode
}

void MainWindow::handleMergeButton() {
    if (m_fileList->count() == 0) {
        QMessageBox::warning(this, tr("警告"), tr("请至少添加一个文件进行合并。"));
        return;
    }

    QString outputPath = m_outputPathEdit->text().trimmed();
    if (outputPath.isEmpty()) {
        QMessageBox::warning(this, tr("警告"), tr("请选择输出文件路径。"));
        return;
    }

    // Collect file paths
    QStringList filePaths;
    for (int i = 0; i < m_fileList->count(); ++i) {
        filePaths.append(m_fileList->item(i)->text());
    }

    // Setup options
    MergeOptions options;
    options.mode = static_cast<MergeMode>(m_mergeModeCombo->currentData().toInt());
    options.format = static_cast<OutputFormat>(m_outputFormatCombo->currentData().toInt());
    options.outputFilePath = outputPath;
    options.includeHeader = m_includeHeaderCheck->isChecked();
    options.skipDuplicates = m_skipDuplicatesCheck->isChecked();
    options.csvSeparator = m_separatorCombo->currentData().toChar();
    options.encoding = m_encodingCombo->currentData().toString();

    // Disable UI during merge
    m_progressBar->setVisible(true);
    m_progressBar->setValue(0);
    m_mergeButton->setEnabled(false);
    m_addButton->setEnabled(false);
    m_removeButton->setEnabled(false);
    m_clearButton->setEnabled(false);
    m_statusLabel->setText(tr("正在合并..."));
    m_logEdit->append(tr("<span style='color:#2196F3;'>--- 开始合并 %1 个文件 ---</span>").arg(filePaths.size()));

    // Launch async merge
    m_mergeWorker->filePaths = filePaths;
    m_mergeWorker->options = options;
    emit startMergeWork(); // triggers worker->doWork via signal-slot connection
}

void MainWindow::onMergeFinished(const MergeResult& result, const QString& errorMsg) {
    // Re-enable UI
    m_mergeButton->setEnabled(true);
    m_addButton->setEnabled(true);
    m_removeButton->setEnabled(true);
    m_clearButton->setEnabled(true);

    if (!errorMsg.isEmpty()) {
        m_logEdit->append(tr("<span style='color:red;'>合并错误：%1</span>").arg(errorMsg));
        QMessageBox::critical(this, tr("错误"), errorMsg);
        m_progressBar->setVisible(false);
        m_statusLabel->setText(tr("合并失败"));
        return;
    }

    if (result.totalRows == 0) {
        m_logEdit->append(tr("<span style='color:#FF9800;'>合并结果为空</span>"));
        QMessageBox::warning(this, tr("警告"), tr("合并结果为空，没有数据可保存。"));
        m_progressBar->setVisible(false);
        m_statusLabel->setText(tr("合并完成（无数据）"));
        return;
    }

    m_logEdit->append(tr("<span style='color:#4CAF50;'>合并完成：%1 行 x %2 列</span>")
        .arg(result.totalRows).arg(result.totalColumns));

    // File was already saved by streaming merge
    if (!result.outputFilePath.isEmpty()) {
        m_logEdit->append(tr("<span style='color:#4CAF50;'>文件已保存至：%1</span>").arg(result.outputFilePath));
    }

    QMessageBox::information(this, tr("成功"),
        tr("合并成功完成！\n\n"
           "总行数：%1\n总列数：%2\n"
           "合并文件数：%3\n\n"
           "输出保存至：\n%4")
            .arg(result.totalRows)
            .arg(result.totalColumns)
            .arg(result.mergedFiles.size())
            .arg(result.outputFilePath));

    // Show merged result in preview (first 25 rows, collected during streaming)
    m_tableModel->setTable(result.previewData);
    m_previewInfoLabel->setText(tr("合并结果 | %1 行 x %2 列（预览前 25 行）")
        .arg(result.totalRows).arg(result.totalColumns));

    m_progressBar->setValue(100);
    m_statusLabel->setText(tr("合并完成 - %1 行 x %2 列")
        .arg(result.totalRows).arg(result.totalColumns));

    // Auto-hide progress after delay
    QTimer::singleShot(2000, this, [this]() {
        m_progressBar->setVisible(false);
    });
}

void MainWindow::updateFileCount() {
    int count = m_fileList->count();
    qint64 totalSize = 0;
    for (int i = 0; i < count; ++i) {
        QFileInfo fi(m_fileList->item(i)->text());
        totalSize += fi.size();
    }
    m_fileCountLabel->setText(tr("%1 个文件 | 总大小：%2").arg(count).arg(formatFileSize(totalSize)));
}

QString MainWindow::formatFileSize(qint64 bytes) {
    if (bytes < 1024) return QString("%1 B").arg(bytes);
    if (bytes < 1024 * 1024) return QString("%1 KB").arg(bytes / 1024.0, 1, 'f', 1);
    if (bytes < 1024 * 1024 * 1024) return QString("%1 MB").arg(bytes / (1024.0 * 1024), 1, 'f', 1);
    return QString("%1 GB").arg(bytes / (1024.0 * 1024 * 1024), 1, 'f', 1);
}

void MainWindow::showDonateDialog() {
    QDialog dialog(this);
    dialog.setWindowTitle(tr("赞助开发者"));
    dialog.setFixedSize(320, 400);
    dialog.setStyleSheet(
        "QDialog { background-color: #ffffff; }"
        "QLabel { color: #333333; }"
    );

    QVBoxLayout* layout = new QVBoxLayout(&dialog);
    layout->setContentsMargins(24, 20, 24, 20);
    layout->setSpacing(12);

    // Title
    QLabel* titleLabel = new QLabel(tr("请作者喝杯咖啡"));
    titleLabel->setAlignment(Qt::AlignCenter);
    titleLabel->setStyleSheet("font-size: 18px; font-weight: bold; color: #333;");
    layout->addWidget(titleLabel);

    // Subtitle
    QLabel* subtitleLabel = new QLabel(tr("您的支持是我持续更新的动力"));
    subtitleLabel->setAlignment(Qt::AlignCenter);
    subtitleLabel->setStyleSheet("font-size: 12px; color: #888;");
    layout->addWidget(subtitleLabel);

    layout->addSpacing(8);

    // QR code image
    QLabel* imageLabel = new QLabel();
    QPixmap pixmap(":/donate_qrcode.png");
    if (!pixmap.isNull()) {
        // Scale to fit, maintain aspect ratio
        int maxSize = 220;
        QPixmap scaled = pixmap.scaled(maxSize, maxSize, Qt::KeepAspectRatio, Qt::SmoothTransformation);
        imageLabel->setPixmap(scaled);
        imageLabel->setAlignment(Qt::AlignCenter);
    } else {
        imageLabel->setText(tr("收款码加载失败"));
        imageLabel->setAlignment(Qt::AlignCenter);
    }
    layout->addWidget(imageLabel);

    layout->addSpacing(8);

    // Hint
    QLabel* hintLabel = new QLabel(tr("微信/支付宝扫码即可赞助"));
    hintLabel->setAlignment(Qt::AlignCenter);
    hintLabel->setStyleSheet("font-size: 11px; color: #999;");
    layout->addWidget(hintLabel);

    layout->addStretch();

    // Close button
    QPushButton* closeButton = new QPushButton(tr("关闭"));
    closeButton->setFixedWidth(100);
    closeButton->setStyleSheet(
        "QPushButton {"
        "  background-color: #4CAF50; color: white; font-weight: bold;"
        "  border: none; border-radius: 4px; padding: 8px 16px;"
        "}"
        "QPushButton:hover { background-color: #45a049; }"
    );
    connect(closeButton, &QPushButton::clicked, &dialog, &QDialog::accept);
    layout->addWidget(closeButton, 0, Qt::AlignCenter);

    dialog.exec();
}
