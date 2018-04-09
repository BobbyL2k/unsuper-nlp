const request = require('request-promise-native');

async function loadPageHtml(topic) {
    return await request({
        url: `https://pantip.com/topic/${topic}`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36' }
    });
}

async function loadComments(topic) {
    const files = [];
    files.push(await loadComment(topic, 1));
    const totalFiles = Math.ceil(files[0].count / 100);
    for (let pageIndex = 2; pageIndex <= totalFiles; pageIndex++) {
        files.push(await loadComment(topic, pageIndex))
    }
    return files;
}

async function loadComment(topic, pageIndex) {
    return JSON.parse(await request({
        url: `https://pantip.com/forum/topic/render_comments?tid=${topic}&param=page${pageIndex}`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
            'referer': `https://pantip.com/topic/${topic}`,
            'x-requested-with': 'XMLHttpRequest'
        }
    }));
}

module.exports = {
    loadComment,
    loadComments,
    loadPageHtml,
};