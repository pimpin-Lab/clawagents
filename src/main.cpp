#include <QApplication>
#include <QDir>
#include "MainWindow.h"

int main(int argc, char* argv[]) {
    // Set application attributes
    QApplication::setApplicationName("ExcelMerger");
    QApplication::setApplicationVersion("1.0.0");
    QApplication::setOrganizationName("ExcelMerger");

    QApplication app(argc, argv);

    // Set high DPI scaling
    QApplication::setHighDpiScaleFactorRoundingPolicy(Qt::HighDpiScaleFactorRoundingPolicy::PassThrough);

    MainWindow window;
    window.show();

    return app.exec();
}
