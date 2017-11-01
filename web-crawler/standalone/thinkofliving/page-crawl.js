const fs = require('fs');
const request = require('request');
const shell = require('shelljs');
const readline = require('readline');
const async = require('async');

lines = fs.readFileSync('data/topic.txt').toString().split('\n');

async.eachOfLimit(lines, 5, (line, index, callback) => {
    var postId = `${line}`.split('/')[1]
    fs.exists(`data/html/thinkofliving.com${postId}.html`, (exist) => {
        console.log('loading', postId, `${index}/${lines.length} ${Math.floor(index / lines.length * 100)}%`);
        if (exist) {
            console.log('page already loaded');
            return callback();
        } else {
            request({
                url: `https://thinkofliving.com/forum${line}`,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36' }
            })
                .pipe(fs.createWriteStream(`data/html/thinkofliving.com${postId}.html`))
                .on('close', () => {
                    setTimeout(callback, 110);
                });
        }
    });

}, () => {
    console.log('Done!');
});
