import { Collection, MongoClient } from "mongodb";

export type ProjectSchema = {
    id: string,
    info: {
        [key: string]: string | number,
    },
    matches?: {
        [matchId: string]: {
            contentId: string,
            projectId: string,
            from: number,
            to: number,
            label?: {
                [user: string]: {
                    isValid: boolean,
                },
            },
            [key: string]: any,
        },
    },
};

type HelperForm<T extends string, T2> = {[key in T]: { str:T, value:T2 } }

export type DomainValue = "sentiment";

export type SentimentValue = "positive" | "negative" | "neutral" | "mixed";
export const SentimentValue: HelperForm<SentimentValue, null> = {
    positive: {
        str:"positive",
        value: null,
    },
    negative: {
        str:"negative",
        value: null,
    },
    neutral: {
        str:"neutral",
        value: null,
    },
    mixed: {
        str:"mixed",
        value: null,
    },
}

export type Domain = SentimentValue;

export const DomainValue: HelperForm<DomainValue, HelperForm<SentimentValue, null>> = {
    sentiment: {
        str: "sentiment",
        value: SentimentValue,
    },
}

type DomainForm<T> = {
    user: string,
    value: T,
}

export type ContentSchema = {
    id: string,
    text: string,
    info: {
        [key: string]: string | number,
    },
    tag?: {
        [key: string]: boolean | { user: string },
    },
    label?: {
        sentiment?: DomainForm<SentimentValue>,
    },
    tags?: {
        [key: string]: { start: number, end: number }[],
    },
};

export type UserSchema = {
    id: string,
    password: string,
    lastEntryIndex?: number,
};

export type ContentCollection = Collection<ContentSchema>;
export type ProjectCollection = Collection<ProjectSchema>;
export type UserCollection = Collection<UserSchema>;

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "nlp";

let client: MongoClient;

// Use connect method to connect to the server
export async function connectDb(
    func: (contents: ContentCollection, projects: ProjectCollection, users: UserCollection) => Promise<void>,
) {
    if (client === undefined) {
        client = await MongoClient.connect(url);
        console.log("Connected successfully to server");
    }

    const db = client.db(dbName);
    const contents = db.collection<ContentSchema>("contents");
    const projects = db.collection<ProjectSchema>("projects");
    const users = db.collection<UserSchema>("users");

    try {
        await func(contents, projects, users);
    } catch (err) {
        // client.close();
        throw err;
    }
    // client.close();
}

export type connectDbType = typeof connectDb;
