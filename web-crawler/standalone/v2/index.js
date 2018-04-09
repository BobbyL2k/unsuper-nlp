const request = require('request-promise-native');
const fs = require('mz/fs');
const pantip = require('./module/pantip');
const cheerio = require('cheerio');

(async function (params) {
    {// Test
        // const comments = await pantip.loadComments('37282301');
        // await fs.writeFile("data/c-buffer.json", JSON.stringify(comments, null, 4));
        const entries = [];
        const commentsRawData = JSON.parse((await fs.readFile("data/c-buffer.json")).toString());
        for (const page of commentsRawData) {
            for (const comment of page.comments) {
                entries.push({
                    id: `${page.paging.topic_id}-${comment._id}`,
                    post: comment.message,
                    time: comment.data_utime,
                });
                for (const reply of comment.replies) {
                    entries.push({
                        id: `${page.paging.topic_id}-${comment._id}-${reply.reply_id}`,
                        post: reply.message,
                        time: reply.data_utime,
                    });
                }
            }
        }
        await fs.writeFile("data/parsed-c.json", JSON.stringify(entries, null, 4));
    }
})()
    .then(() => {
        console.log('Main Function Done');
    })
    .catch((err) => {
        console.log('Error in Main Function', err);
    });