cmake_minimum_required(VERSION 3.16)
project(ExcelMerger VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Find Qt6
find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets)

# Source files
set(SOURCES
    src/main.cpp
    src/MainWindow.cpp
    src/CsvParser.cpp
    src/ExcelParser.cpp
    src/MergeEngine.cpp
    src/FileTableModel.cpp
)

set(HEADERS
    src/MainWindow.h
    src/CsvParser.h
    src/ExcelParser.h
    src/MergeEngine.h
    src/FileTableModel.h
)

set(RESOURCES
    resources.qrc
)

# Create executable
add_executable(${PROJECT_NAME} WIN32 ${SOURCES} ${HEADERS} ${RESOURCES})

target_link_libraries(${PROJECT_NAME} PRIVATE Qt6::Core Qt6::Gui Qt6::Widgets)

# Enable static linking for standalone executable
set_target_properties(${PROJECT_NAME} PROPERTIES
    WIN32_EXECUTABLE TRUE
    OUTPUT_NAME "ExcelMerger"
)

# Add Qt deployment tool
if(WIN32)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${Qt6_DIR}/../../../bin/windeployqt.exe --release --no-translations --no-system-d3d-compiler --no-opengl-sw "$<TARGET_FILE:${PROJECT_NAME}>"
        COMMENT "Deploying Qt dependencies..."
    )
    # Copy MinGW runtime DLLs (windeployqt does NOT include these)
    set(MINGW_RUNTIME_DLLS
        libgcc_s_seh-1.dll libstdc++-6.dll libwinpthread-1.dll
        libb2-1.dll libdouble-conversion.dll
        libicuin78.dll libicuuc78.dll libicudt78.dll
        libpcre2-16-0.dll libpcre2-8-0.dll zlib1.dll libzstd.dll
        libfreetype-6.dll libbrotlidec.dll libbrotlicommon.dll libbz2-1.dll
        libharfbuzz-0.dll libglib-2.0-0.dll libintl-8.dll libiconv-2.dll
        libgraphite2.dll libmd4c.dll libpng16-16.dll
    )
    foreach(DLL_NAME ${MINGW_RUNTIME_DLLS})
        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
                "${CMAKE_PREFIX_PATH}/bin/${DLL_NAME}"
                "$<TARGET_FILE_DIR:${PROJECT_NAME}>/${DLL_NAME}"
            COMMENT "Copying ${DLL_NAME}..."
        )
    endforeach()
endif()
