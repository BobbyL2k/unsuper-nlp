"use strict";
const async = require('async');
const cheerio = require('cheerio');
const concat = require('concat-stream');
const fs = require('fs');
const request = require('request');

processIndex('/forum/home');

function processIndex(indexRoute) {
    console.log('loading', indexRoute);
    request.get({
        baseUrl: `https://pantip.com`,
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36' },
        uri: indexRoute
    })
        .pipe(concat(htmlBuffer => {
            let { nextIndex, topics } = processHtmlBuffer(htmlBuffer);
            async.parallel([
                (callback) => {
                    fs.appendFile('data/index.txt', `${nextIndex}\n`, err => {
                        callback(err);
                    });
                },
                (callback) => {
                    fs.appendFile('data/topic.txt', `${topics.join('\n')}\n`, err => {
                        callback(err);
                    });
                }
            ], (err) => {
                if (err) return console.log(err);
                console.log('done');
                setTimeout(function () {
                    processIndex(nextIndex);
                }, 1000);
            });
        }));

    function processHtmlBuffer(htmlBuffer) {
        const htmlString = htmlBuffer.toString();
        let $ = cheerio.load(htmlString);

        let nextIndexDom = $('#index-main .indexlist a')[0];
        let topics = $('#show_topic_lists .post-item-title a');
        let topicsDom = [];

        for (var c = 0; c < topics.length; c++) {
            topicsDom.push(topics[c]);
        }

        return {
            nextIndex: nextIndexDom.attribs.href,
            topics: topicsDom.map(topicDom => topicDom.attribs.href)
        };
    }
}
