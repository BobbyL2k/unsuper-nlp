#!/bin/sh
set -e
echo "COMPILING"
clang++ \
    --std=c++14 \
    ./data-processor/string-distance/cpp/src/main.cpp \
    ./data-processor/string-distance/cpp/src/wide_string.cpp \
    -o ./data-processor/string-distance/cpp/build/main.out
echo "RUNNING"
./data-processor/string-distance/cpp/build/main.out -target content gum
