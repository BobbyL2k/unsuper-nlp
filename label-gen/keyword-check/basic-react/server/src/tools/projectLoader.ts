import * as assert from "assert";
import * as fs from "fs-extra";
import * as minimist from "minimist";
import { connectDb } from "../nlp-db";

const argv = minimist(process.argv.slice(2));

assert(argv._.length === 1, "Need 1 file argument (metadata)");

connectDb(async (contents, projects) => {
    const filePath = argv._[0];
    const inputFile = JSON.parse((await fs.readFile(filePath)).toString());
    let success = 0;
    const totalEntries = Object.keys(inputFile).length;
    console.log("total of", totalEntries);
    async function insert(key: string) {
        const result = await projects.findOneAndUpdate(
            {
                id: key,
            }, {
                $setOnInsert: {
                    id: key,
                },
                $set: {
                    info: inputFile[key],
                },
            }, {
                upsert: true,
            });
        if (result.lastErrorObject.updatedExisting === false) {
            success++;
        }
    }
    await Promise.all(Object.keys(inputFile).map(insert));
    console.log(`${success} entries made out of ${totalEntries}`);
    console.log(`Rate ${Math.round(success / totalEntries * 100)}%`);
});
