'use strict';
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFolder = '../../../web-crawler/standalone/thinkofliving/data/html/';
const outputFolder = '../../../web-crawler/standalone/thinkofliving/data/post/';

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
    const title = $('div.qa-main>h1>span.entry-title').text().trim();
    const post = $('div.qa-q-view-content>div.entry-content').text().trim();
    const time = $('span.qa-q-view-when-data>span>span.value-title').attr('title');
    //var comment ="";
    var comment = $('.qa-a-item-content > div.entry-content').text().trim();
    //commentQ.forEach((comm,index)=>{
    //  comment += index+" "+comm.text().trim();
    //});
//console.log(comment);
    // path.join(outputFolder, htmlFile.split('.')[0] + '.json')
    fs.appendFileSync('../../../web-crawler/standalone/thinkofliving/posts.json', JSON.stringify(
        { id, title, post, time }
    ) + '\n');
});
