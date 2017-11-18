#include "wide_string.hpp"
#include <cassert>
#include <clocale>

bool utf8_locale_check(const char locale[]) {
    const char match[] = "UTF-8";
    int c;
    for (c = 0; locale[c] && match[c]; c++) {
        if (locale[c] != match[c]) {
            return false;
        }
    }
    return locale[c] == match[c];
}

void setup_locale() {
    setlocale(LC_ALL, "");
    assert(utf8_locale_check(setlocale(LC_CTYPE, NULL)));
}

wide_string utf8_to_widestring(const std::string str) {
    wide_string result;
    wide_char wch;
    int left = 0;
    for (int c = 0; c < str.size(); c++) {
        unsigned char ch = str[c];
        if (ch & 0x80) {
            if (left > 0) {
                assert((ch & 0xC0) == 0x80);
                wch = (wch << 8) | ch;
                left--;
                if (left) continue;
            } else {
                if ((ch & 0xE0) == 0xC0) {
                    left = 1;
                } else if ((ch & 0xF0) == 0xE0) {
                    left = 2;
                } else if ((ch & 0xF8) == 0xF0) {
                    left = 3;
                } else {
                    assert(false);
                }
                wch = (wch << 8) | ch;
                continue;
            }
        } else {
            assert(left == 0);
            wch = ch;
        }
        result.push_back(wch);
        wch = 0;
    }
    return result;
}

void display(std::ostream &out, const wide_char ch) {
    for (int c = 3; c >= 0; c--) {
        out << (char)(255 & (ch >> (8 * c)));
    }
}

std::vector<range> find_substring(const wide_string large_str,
                                  const wide_string small_str,
                                  int accept_error) {
    struct finder {
        int distance;
        int end_at;
    };
    struct full_finder {
        finder set[2];
    };
    const int large_size = large_str.size();
    std::vector<full_finder> v_find(large_size + 1);
    for (int c = 0; c < large_size + 1; c++) {
        v_find[c].set[small_str.size() & 1].end_at = c;
    }
    for (int cs = small_str.size() - 1; cs >= 0; cs--) {
        int now = cs & 1;
        int last = now ^ 1;
        for (int cl = large_str.size() - 1; cl >= 0; cl--) {
            if (large_str[cl] == small_str[cs]) {
                v_find[cl].set[now].distance =
                    v_find[cl + 1].set[last].distance;
                v_find[cl].set[now].end_at = v_find[cl + 1].set[last].end_at;
            } else {
                if (v_find[cl].set[last].distance <
                    v_find[cl + 1].set[now].distance) {
                    v_find[cl].set[now].distance =
                        1 + v_find[cl].set[last].distance;
                    v_find[cl].set[now].end_at = v_find[cl].set[last].end_at;
                } else {
                    v_find[cl].set[now].distance =
                        1 + v_find[cl + 1].set[now].distance;
                    v_find[cl].set[now].end_at = v_find[cl + 1].set[now].end_at;
                }
            }
        }
        v_find[large_size].set[now].distance = small_str.size() - cs;
        v_find[large_size].set[now].end_at = large_size;
    }

    std::vector<range> result;

    for (int start_at = 0; start_at < v_find.size(); start_at++) {
        const int now = 0;
        const finder &find = v_find[start_at].set[now];
        bool valid = true;

        if (find.distance > accept_error) {
            valid = false;
        }

        if (start_at + 1 < v_find.size()) {
            if (v_find[start_at].set[now].distance ==
                v_find[start_at + 1].set[now].distance + 1) {
                valid = false;
            }
        }
        if (start_at > 0) {
            if (v_find[start_at].set[now].distance ==
                v_find[start_at - 1].set[now].distance + 1) {
                valid = false;
            }
        }

        if (valid) {
            result.push_back((range){.from = start_at,
                                     .distance = find.distance,
                                     .to = find.end_at});
        }
    }

    return result;
}
