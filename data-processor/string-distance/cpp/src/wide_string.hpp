#include <ostream>
#include <string>
#include <vector>

typedef uint32_t wide_char;
typedef std::vector<wide_char> wide_string;

typedef struct {
    int from;
    int to;
    int distance;
} range;

void setup_locale();

wide_string utf8_to_widestring(const std::string str);

std::vector<range> find_substring(const wide_string large_str,
                                  const wide_string small_str,
                                  int accept_error = 0);

void display(std::ostream &out, const wide_char ch);