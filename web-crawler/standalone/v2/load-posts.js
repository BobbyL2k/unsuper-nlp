const request = require('request-promise-native');
const fs = require('mz/fs');
const pantip = require('./module/pantip');
const cheerio = require('cheerio');

(async function (params) {
    {// load posts with ids specified from a file
        const content = (await fs.readFile('data/topic.txt')).toString().split('\n');
        // console.log(content.length, content[0].length);
        let c = 0;
        for (const id of content) {
            console.log(`loading ${id} entry ${c} of ${content.length} ${c / content.length * 100}%`);
            c++;
            const html = await pantip.loadPageHtml(id);
            const $ = cheerio.load(html);
            const title = $('.display-post-title').text().trim();
            const post = $('.display-post-story:not(.main-comment)').text().trim();
            const time = $('.display-post-timestamp abbr').attr('data-utime');

            await fs.appendFile('data/formated/pantip/posts.json', JSON.stringify(
                { id, title, post, time }
            ) + '\n');
        }
    }
})()
    .then(() => {
        console.log('Main Function Done');
    })
    .catch((err) => {
        console.log('Error in Main Function', err);
    });