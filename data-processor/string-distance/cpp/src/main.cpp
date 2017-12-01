#include <cassert>
#include <fstream>
#include <iostream>
#include "json.hpp"
#include "wide_string.hpp"

using namespace std;
using json = nlohmann::json;

string slurp(ifstream &in) {
    stringstream sstr;
    sstr << in.rdbuf();
    return sstr.str();
}

json process_argument(int argc, char *argv[]){
    json result;
    auto &flags = result["flags"] = json::object();
    auto &values = result["values"] = json::array();
    for(int c=1; c<argc; c++){
        string arg_str(argv[c]);
        if(c < argc-1 && arg_str.at(0) == '-'){
            auto value = string(argv[c+1]);
            cout << "tes " << arg_str.substr(1) << " " << value << endl;
            flags[arg_str.substr(1)] = value;
            c++;
        }else{
            values.push_back(arg_str);
        }
    }
    for(auto flag : flags){
        cout << flag << endl;
    }
    return result;
}

int main(int argc, char *argv[]) {
    for(int c=0; c<argc; c++){
        cout << c << " " << argv[c] << endl;
    }

    auto args = process_argument(argc, argv);
    cout << args.dump(4) << endl;

    // read a JSON file
    // std::ifstream i("./data-processor/string-distance/cpp/build/key.json");
    // json j;
    // // write prettified JSON to another file
    // std::ofstream o("./data-processor/string-distance/cpp/build/pretty.json");

    // i >> j;
    // o << j << std::endl;
    // i >> j;
    // o << j << std::endl;

    // setup_locale();

    // ifstream file;
    // file.open("./data-processor/string-distance/cpp/build/str.txt");
    // assert(file.is_open());
    // string s1, s2;
    // getline(file, s1);
    // getline(file, s2);
    // auto ws1 = utf8_to_widestring(s1);
    // auto ws2 = utf8_to_widestring(s2);
    // cout << "input long  string : " << s1 << "\nlength : " << ws1.size()
    //      << "\n";
    // cout << "input short string : " << s2 << "\nlength : " << ws2.size()
    //      << "\n";

    // // for (int c = 0; c < ws1.size(); c++) {
    // //     for (int c2 = 0; c2 < ws2.size(); c2++) {
    // //         cout << (ws1[c] == ws2[c2]) << "|";
    // //     }
    // //     cout << "\n";
    // // }
    // auto good_ranges = find_substring(ws1, ws2, 5);

    // for (auto good_range : good_ranges) {
    //     for (int c = 0; c < ws1.size(); c++) {
    //         if (c == good_range.from) {
    //             cout << "\"";
    //         }
    //         display(cout, ws1[c]);
    //         if (c == good_range.to - 1) {
    //             cout << "\"";
    //         }
    //     }
    //     cout << endl
    //          << good_range.from << " " << good_range.distance << " "
    //          << good_range.to << endl;
    // }
    return 0;
}
