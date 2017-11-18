#!/bin/sh
set -e
clang++ \
    --std=c++14 \
    ./data-processor/string-distance/cpp/src/main.cpp \
    ./data-processor/string-distance/cpp/src/wide_string.cpp \
    -o ./data-processor/string-distance/cpp/build/main.out
./data-processor/string-distance/cpp/build/main.out
