const fs = require('fs');

const content = fs.readFileSync(__dirname + "/../../data/json/matches/match.json")
    .toString()
    .split('\n')
    .filter(str => str.length !== 0);

const ltb = {};

for (const entry of content) {
    ltb[entry] = true;
}

const cleanedContent = [];

for (const entry in ltb) {
    cleanedContent.push(entry);
}

const outputBuffer = cleanedContent.join('\n') + '\n';

fs.writeFileSync(__dirname + "/../../data/json/matches/match_cleaned.json", outputBuffer);

console.log('Done');