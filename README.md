# Excel/CSV Merger

一个简单易用的 Excel (.xlsx) 和 CSV 文件合并工具，基于 C++ Qt6 开发。

## 功能特性

- **三种合并模式**
  - 纵向合并（追加行） — 将多个文件的行依次拼接
  - 横向合并（追加列） — 将多个文件的列并排拼接
  - 智能合并（匹配表头） — 按列名自动对齐，不同文件可以有不同列

- **流式处理** — CSV 文件采用逐行读取流式合并，内存占用恒定，轻松处理 1GB+ 大文件
- **格式支持** — `.csv` / `.tsv` / `.txt` / `.xlsx` / `.xls`
- **编码支持** — UTF-8（带 BOM）、GBK/GB2312
- **智能检测** — 自动检测文件编码和分隔符（逗号、制表符、分号、竖线）
- **拖拽操作** — 直接拖拽文件到窗口添加
- **数据预览** — 选择文件即可预览前 25 行数据
- **多选操作** — 支持批量添加、批量移除文件

## 截图

![主界面](https://github.com/pimpin-Lab/clawagents/raw/main/screenshot.png)

## 编译

### 环境要求

- CMake 3.16+
- Qt6 (Core, Gui, Widgets)
- C++17 编译器 (GCC / MSVC / Clang)

### 编译步骤

```bash
cd excel-merger
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . -j$(nproc)
```

## 使用

1. 点击 **添加文件** 或直接拖拽 CSV/Excel 文件到左侧列表
2. 在右侧预览数据，确认文件内容正确
3. 选择合并模式、分隔符、编码等选项
4. 选择输出路径，点击 **合并文件**

## 下载

前往 [Releases](https://github.com/pimpin-Lab/clawagents/releases) 页面下载最新版本，解压后直接运行 `ExcelMerger.exe`。

## 技术架构

```
MainWindow (UI)
  ├── FileTableModel (QAbstractTableModel 数据预览)
  ├── MergeWorker (QThread 异步合并)
  │     └── MergeEngine (合并引擎)
  │           ├── CsvStreamReader (流式 CSV 读取, 常量内存)
  │           ├── CsvParser (CSV 解析 + 编码/分隔符检测)
  │           └── ExcelParser (XLSX 解析)
  └── Donate QR (Qt 资源系统内嵌收款码)
```

## 许可证

MIT License
