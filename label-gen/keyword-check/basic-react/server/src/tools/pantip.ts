import * as request from "request-promise-native";

export async function loadPageHtml(topic: string | number) {
    return await request({
        url: `https://pantip.com/topic/${topic}`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36' }
    });
}

export async function loadComments(topic: string | number) {
    const files = [];
    files.push(await loadComment(topic, 1));
    const totalFiles = Math.ceil(files[0].count / 100);
    for (let pageIndex = 2; pageIndex <= totalFiles; pageIndex++) {
        files.push(await loadComment(topic, pageIndex))
    }
    return files;
}

export async function loadComment(topic: string | number, pageIndex: number) {
    return JSON.parse(await request({
        url: `https://pantip.com/forum/topic/render_comments?tid=${topic}&param=page${pageIndex}`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
            'referer': `https://pantip.com/topic/${topic}`,
            'x-requested-with': 'XMLHttpRequest'
        }
    }));
}