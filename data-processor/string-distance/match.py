import numpy as np
import os
import json

_keywords = None
_DIR = os.path.dirname(os.path.abspath(__file__))


class DuplicateKeywordsError(Exception):
    """Diplicate keywords are found in the metadata (keywords.json)."""
    pass


def get_keywords():
    global _keywords
    if _keywords == None:
        with open(os.path.join(_DIR, '../../data/json/metadata/', 'keywords.json')) as file:
            obj = json.load(file)
            _keywords = []
            for key in obj:
                for keyword in obj[key]:
                    if keyword not in _keywords:
                        _keywords.append(keyword)
    return _keywords


def np_string(str):
    return np.array(list(str))


def string_search(lg_npstr, sm_npstr, threshold=0.25, keep_best=True):
    """
    Search in the long_np_string for the short_np_string if a match is found
    that is within the tolerance threshold (ratio to the sm_npstr's length)
    the starting-index of the match in each occurrences are returned
    """
    if type(lg_npstr) == str:
        lg_npstr = np_string(lg_npstr)
    if type(sm_npstr) == str:
        sm_npstr = np_string(sm_npstr)
    mem = np.zeros(lg_npstr.shape[0] + 2).astype(int)
    loc_to = np.arange(lg_npstr.shape[0] + 2)

    for i in range(sm_npstr.shape[0]):
        cmp = np.append((lg_npstr != sm_npstr[-1 - i]), True)
        # print('lg_npstr', lg_npstr != sm_npstr[-1 - i]))
        # print('cmp', cmp)
        # print('mem', mem)
        mem[:-1][np.bitwise_not(cmp)] = mem[1:][np.bitwise_not(cmp)]
        if i != 1:
            loc_to[:-1][np.bitwise_not(cmp)] = loc_to[1:][np.bitwise_not(cmp)]
        mem[:-1][cmp] = mem[:-1][cmp] + 1

        for i2 in range(mem.shape[0] - 2, -1, -1):
            if mem[i2] >= 1 + mem[i2 + 1]:
                mem[i2] = 1 + mem[i2 + 1]
                loc_to[i2] = loc_to[i2 + 1]

        mem[-1] = mem[-2]

#         print(cmp.astype(int), '  c', sm_npstr[-1 - i:])
#         print(mem, 'm')

#         print('cmp', cmp.astype(int)*10)
#         print('mem', np.append(mem[:-1], 99))
#         print('loc', loc_to)
#         print('arg', np.arange(lg_npstr.shape[0] + 1))

    pass_threshold = mem[:-2] < sm_npstr.shape[0] * threshold

    index_from = np.argwhere(pass_threshold).reshape(-1)
    index_to = loc_to[:-2][pass_threshold]

    distance = mem[:-2][pass_threshold]

    if not keep_best:
        return index_from, index_to, distance

    struct = list(zip(index_from, index_to, distance))
    struct.sort(key=lambda x: x[2])

    to_remove = [False] * len(struct)
    for index, elem in enumerate(struct):
        fr_e, _, dis_e = elem
        for index_c in range(index + 1, len(struct)):
            fr_c, _, dis_c = struct[index_c]
            if abs(fr_c - fr_e) >= dis_c - dis_e:
                to_remove[index_c] = True

    temp = struct
    struct = []

    for elem, remove in zip(temp, to_remove):
        if remove == False:
            struct.append(elem)

    return struct
