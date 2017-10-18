'use strict';
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFolder = '../../../data/html/pantip.com/topic/';
const outputFolder = '../../../data/formated/pantip/post/';

var htmlFiles = fs.readdirSync(htmlFolder);
var filesWritten = fs.readdirSync(outputFolder);
var ltbFilesWritten = {};
filesWritten.forEach(filename => {
    ltbFilesWritten[filename.split('.')[0]] = true;
});

// let htmlFile = htmlFiles[0];
htmlFiles.forEach((htmlFile, index) => {
    const id = parseInt(htmlFile.split('.')[0]);
    // if (ltbFilesWritten[]) {
    //     return;
    // }
    console.log(index, htmlFiles.length);
    const html = fs.readFileSync(path.join(htmlFolder, htmlFile)).toString();
    const $ = cheerio.load(html);
    const title = $('.display-post-title').text().trim();
    const post = $('.display-post-story:not(.main-comment)').text().trim();
    const time = $('.display-post-timestamp abbr').attr('data-utime');

    // path.join(outputFolder, htmlFile.split('.')[0] + '.json')
    fs.appendFileSync('../../../data/formated/pantip/posts.json', JSON.stringify(
        { id, title, post, time }
    ) + '\n');
});
