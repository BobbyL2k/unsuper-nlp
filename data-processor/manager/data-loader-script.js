const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fs = require('fs');
mongoose.connect('mongodb://localhost/unsuper-nlp', { useMongoClient: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!");
});

mongoose.Promise = global.Promise;

const MatchesSchema = new Schema({
    matchId: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    contentId: {
        type: String,
        index: true,
        required: true,
    },
    from: {
        type: Number,
        required: true,
    },
    to: {
        type: Number,
        required: true,
    },
    distance: {
        type: Number,
        required: true,
    },
    matched: String,
    projectId: {
        type: String,
        index: true,
        required: true,
    },
    label: {
        type: Schema.Types.Mixed,
        setDefaultsOnInsert: true,
        default() {
            return {};
        },
    },
});

const MatchesModel = mongoose.model('Matches', MatchesSchema);

const ContentsSchema = new Schema({
    id: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    title: {
        type: String,
    },
    post: {
        type: String,
    },
    time: {
        type: String,
    },
    source: {
        type: String,
        required: true,
    },
});

const ContentsModel = mongoose.model('Contents', ContentsSchema);

(async () => {

    // const test_data = { "contentId": "36960764/postxxxz", "distance": 1, "from": 131, "matched": "สาทร", "projectId": "7913", "to": 134 };
    // test_data.matchId = `${test_data.contentId}/${test_data.from}/${test_data.to}/${test_data.projectId}`
    // const pArray = [];
    // for (let c = 0; c < 2; c++) {
    //     const dbEntry = new Matches(test_data);
    //     pArray.push(dbEntry.save())
    // }
    // await Promise.all(pArray);

    const match_data = fs.readFileSync(__dirname + "/../../data/json/matches/match.json")
        .toString()
        .split('\n')
        .filter(str => str.length != 0)
        .map(JSON.parse);

    console.log(match_data[0]);

    for (const matchEntry of match_data) {
        matchEntry.contentId = matchEntry.contentId.split('/').join('-');
        matchEntry.matchId = `${matchEntry.contentId}-${matchEntry.from}-${matchEntry.to}-${matchEntry.projectId}`
        const dbEntry = new MatchesModel(matchEntry);
        try {
            await dbEntry.save();
        } catch (e) {
            console.log(e);
        }
    }

    // await Promise.all(match_data
    //     .map(
    //     async matchEntry => {
    //         matchEntry.matchId = `${matchEntry.contentId}/${matchEntry.from}/${matchEntry.to}/${matchEntry.projectId}`
    //         const dbEntry = new Matches(matchEntry);
    //         // try {
    //         await dbEntry.save();
    //         // } catch (e) {
    //         // console.log(e);
    //         // }
    //         return;
    //     })
    // );

    const pantip_data = fs.readFileSync(__dirname + "/../../data/json/posts/pantip/posts.json")
        .toString()
        .split('\n')
        .filter(str => str.length != 0)
        .map(JSON.parse);

    for (const contentEntry of pantip_data) {
        contentEntry.source = 'pantip'
        const dbEntry = new ContentsModel(contentEntry);
        try {
            await dbEntry.save();
        } catch (e) {
            console.log(e);
        }
    }

    console.log("Done");

})().catch(err => console.error("Main Function Error", err));

