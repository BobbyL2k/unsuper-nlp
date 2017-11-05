const request = require('request');
const fs = require('fs');

request.get({
    uri: "https://pantip.com/forum/topic/render_comments?tid=37012172&param=page1",
    headers: {
        'referer': "https://pantip.com/topic/37012172",
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
    }
}, (err, response, body) => {
    // console.log(body);
    fs.writeFileSync('comment-out.text', body);
});