import * as mongoose from "mongoose";
import { Mongoose } from "mongoose";
mongoose.Promise = Promise;
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/unsuper-nlp', { useMongoClient: true });

export const MatchesSchema = new Schema({
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

export const MatchesModel = mongoose.model('Matches', MatchesSchema);

export const ContentsSchema = new Schema({
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

export const ContentsModel = mongoose.model('Contents', ContentsSchema);

export const UsersSchema = new Schema({
    id: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

export const UsersModel = mongoose.model('Users', UsersSchema);