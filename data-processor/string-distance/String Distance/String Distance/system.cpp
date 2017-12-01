//
//  system.cpp
//  String Distance
//
//  Created by Anuruth Lertpiya on 11/29/2560 BE.
//  Copyright © 2560 L2k nStudio. All rights reserved.
//

#include "system.hpp"

bool isFlag(const std::string &str){
    return str.at(0) == '-';
}

ProcessedArguemnt process_argument(int argumentCount, char *argumentValue[]){
    ProcessedArguemnt p_arg = {
        .log_every = 100,
        .target_arg = "content",
        .keywords_file = "key.json",
        .out_file = "out.json",
    };
    for(int argIndex=1; argIndex<argumentCount; argIndex++){
        std::string arg_str(argumentValue[argIndex]);
        if(arg_str.compare("-h") == 0){
            std::cout << "string-distance IN_FILES... [-target OBJ_ATTRIBUTE] [-out OUT_FILE] [-keywords KEYWORD_FILE]" << std::endl;
            exit(0);
        }
        if(isFlag(arg_str) && argIndex < argumentCount+1){
            auto value = std::string(argumentValue[++argIndex]);
            if(isFlag(value)){
                std::cout << "Error: value for \"" << arg_str << "\" not supplied" << std::endl;
                exit(1);
            }else{
                if(arg_str.compare("-target") == 0){
                    p_arg.target_arg = value;
                }else if(arg_str.compare("-out") == 0){
                    p_arg.out_file = value;
                }else if(arg_str.compare("-keywords") == 0){
                    p_arg.keywords_file = value;
                }else{
                    std::cout << "Error: Unknown flag:\"" << arg_str << "\"" << std::endl;
                    exit(1);
                }
            }
        }else{
            p_arg.in_files.push_back(arg_str);
        }
    }
    return p_arg;
}
