//
//  system.hpp
//  String Distance
//
//  Created by Anuruth Lertpiya on 11/29/2560 BE.
//  Copyright © 2560 L2k nStudio. All rights reserved.
//

#ifndef system_hpp
#define system_hpp

#include <string>
#include <vector>
#include <iostream>

struct ProcessedArguemnt{
    int log_every;
    std::string target_arg;
    std::string keywords_file;
    std::vector<std::string> in_files;
    std::string out_file;
};

bool isFlag(const std::string &str);

ProcessedArguemnt process_argument(int argumentCount, char *argumentValue[]);

#endif /* system_hpp */
