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

export type ContentSchema = {
    id: string,
    text: string,
    info: {
        [key: string]: string | number,
    },
    tag?: { [key: string]: boolean }
};

export type ContentCollection = Collection<ContentSchema>;
export type ProjectCollection = Collection<ProjectSchema>;

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "nlp";

let client: MongoClient;

// Use connect method to connect to the server
export async function connectDb(
    func: (contents: ContentCollection, projects: ProjectCollection) => Promise<void>,
) {
    if (client === undefined) {
        client = await MongoClient.connect(url);
        console.log("Connected successfully to server");
    }

    const db = client.db(dbName);
    const contents = db.collection<ContentSchema>("contents");
    const projects = db.collection<ProjectSchema>("projects");

    try {
        await func(contents, projects);
    } catch (err) {
        // client.close();
        throw err;
    }
    // client.close();
}
