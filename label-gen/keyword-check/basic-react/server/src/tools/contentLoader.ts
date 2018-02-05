import * as assert from "assert";
import * as fs from "fs-extra";
import * as minimist from "minimist";
import { connectDb } from "../nlp-db";

const argv = minimist(process.argv.slice(2));

assert(argv._.length === 1, "Need 1 file argument (metadata)");

connectDb(async (contents, projects) => {
    const filePath = argv._[0];
    const inputFiles =
        (await fs.readFile(filePath))
            .toString()
            .split("\n")
            .filter((s) => s.length !== 0)
            .map((s) => JSON.parse(s));
    let entry = 0;
    let duplicate = 0;
    for (const obj of inputFiles) {
        const id = `${obj.id}/post`;
        const result = await contents.findOneAndUpdate(
            {
                id,
            }, {
                $setOnInsert: {
                    id,
                },
                $set: {
                    text: obj.post,
                    info: {
                        title: obj.title,
                        time: obj.time,
                        source: "pantip",
                    },
                },
            }, {
                upsert: true,
            });
        if (result.lastErrorObject.updatedExisting === true) {
            duplicate++;
        }
        console.log(`ran ${++entry}, duplicate ${duplicate}`);
    }
    console.log(`${duplicate} duplicates of ${entry}`);
    console.log(`Rate ${Math.round(duplicate / entry * 100)}%`);
}).catch((err) => {
    console.log(err);
});
