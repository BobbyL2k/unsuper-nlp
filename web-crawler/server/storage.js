const mongodb = require('mongodb');

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var mongodb_url = 'mongodb://localhost:27017/unsupernlp';

const express = require('express')
const bodyParser = require('body-parser');

const app = express()

const PORT_NUMBER = 80;

app.use(bodyParser.json());

app.all('/', function (req, res) {
    // Use connect method to connect to the Server
    MongoClient.connect(mongodb_url, (err, db) => {
        assert.equal(null, err);
        var collection = db.collection("test_col");
        collection.insertOne(req.body, {w:1}, function(err, result) {
            console.log('inserted ok', result.result.ok);
            res.send(`inserted ok ${result.result.ok}`)
            db.close();
        });
    });
});

app.listen(PORT_NUMBER, function () {
    console.log(`Example app listening on port ${PORT_NUMBER}!`);
});