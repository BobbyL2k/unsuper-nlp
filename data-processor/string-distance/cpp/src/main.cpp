#include <cassert>
#include <fstream>
#include <iostream>
#include "json.hpp"
#include "wide_string.hpp"

using namespace std;
using namespace nlohmann;

string slurp(ifstream &in) {
    stringstream sstr;
    sstr << in.rdbuf();
    return sstr.str();
}

int main(int argc, char *argv[]) {
    // read a JSON file
    std::ifstream i("./data-processor/string-distance/cpp/build/key.json");
    json j;
    // write prettified JSON to another file
    std::ofstream o("./data-processor/string-distance/cpp/build/pretty.json");

    i >> j;
    o << j << std::endl;
    i >> j;
    o << j << std::endl;

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
