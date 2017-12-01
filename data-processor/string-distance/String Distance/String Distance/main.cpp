//
//  main.cpp
//  String Distance
//
//  Created by Anuruth Lertpiya on 11/29/2560 BE.
//  Copyright © 2560 L2k nStudio. All rights reserved.
//

#include <cassert>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <cmath>
#include <string>
#include "json.hpp"
#include "wide_string.hpp"
#include "system.hpp"

using namespace std;
using json = nlohmann::json;

string slurp(ifstream &in) {
    stringstream sstr;
    sstr << in.rdbuf();
    return sstr.str();
}

struct Keyword {
    string raw_keyword;
    wide_string keyword;
    string id;
};
vector<Keyword> load_keywords(string file_path){
    cout << "loading keywords from \"" << file_path << "\"" << endl;
    std::ifstream keyword_json_file(file_path);
    
    json keywords_json;
//    Parse JSON file
    keyword_json_file >> keywords_json;
    
    vector<Keyword> keywords;
    for(
        auto keyword_entry_it = keywords_json.begin();
        keyword_entry_it != keywords_json.end();
        keyword_entry_it++){
        
        auto keyword_entry = keyword_entry_it.value();
        
        Keyword new_keyword;
        new_keyword.id = keyword_entry_it.key();
        
        for(auto keyword = keyword_entry.begin(); keyword != keyword_entry.end(); keyword++){
            new_keyword.raw_keyword = keyword.value();
            new_keyword.keyword = utf8_to_widestring(new_keyword.raw_keyword);
            keywords.push_back(new_keyword);
        }
    }
    
    return keywords;
}

int main(int argc, char *argv[]) {
    setup_locale();
//    cout << setlocale(LC_CTYPE, "UTF-8") << endl;
    auto args = process_argument(argc, argv);
    if(args.in_files.size() != 1){
        cout << "No input file arugment supplied" << endl;
        exit(0);
    }
    
    auto keywords = load_keywords(args.keywords_file);
    
    cout << "Targeting \"" << args.target_arg << "\"" << endl;
    cout << "Loading content from \"" << args.in_files[0] << "\"" << endl;
    std::ifstream input_json_file(args.in_files[0]);
    cout << "Saving matches to \"" << args.in_files[0] << "\"" << endl;
    std::ofstream output_json_file(args.out_file);

    json j;
    int entries_processed = 0;
    while(true){
//        Loading file with multiple entries
        try {
            input_json_file >> j;
        } catch (json::parse_error &e) {
            break;
        }
        if(args.log_every != 0 && entries_processed % args.log_every == 0){
            cout << "processed " << entries_processed << " entried" << endl;
        }
        entries_processed++;
        
        auto str = utf8_to_widestring(j["post"]);
        long contentId = j["id"];
        auto matchedContentId = to_string(contentId)+"/"+args.target_arg;
        
        for(auto keyword : keywords){
            auto matches = find_substring(str, keyword.keyword, min((int)(0.1*str.size()), 1));
            for(auto match : matches){
                json new_match_entry = {
                    {"projectId", keyword.id},
                    {"contentId", matchedContentId},
                    {"from", match.from},
                    {"to", match.to},
                    {"distance", match.distance},
                    {"matched", keyword.raw_keyword},
                };
                output_json_file << new_match_entry.dump() << endl;
            }
        }
    }
    cout << "Processing completed" << endl;
    cout << "processed " << entries_processed << " entried" << endl;
    return 0;
}
