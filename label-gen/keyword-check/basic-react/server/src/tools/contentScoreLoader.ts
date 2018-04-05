import * as assert from "assert";
import * as fs from "fs-extra";
import * as minimist from "minimist";
import { connectDb } from "../nlp-db";

const argv = minimist(process.argv.slice(2));

assert(argv._.length === 1, "Need 1 file argument (metadata)");

connectDb(async (contents, projects) => {
    const filePath = argv._[0];
    const inputFiles: {score:number, id:string}[] =
        (await fs.readFile(filePath))
            .toString()
            .split("\n")
            .filter((s) => s.length !== 0)
            .map((s) => JSON.parse(s));
    for(const inputFile of inputFiles){
        console.log("setting id", inputFile.id);
        await contents.findOneAndUpdate(
            {
                id: inputFile.id,
            }, {
                $set: {
                    score: inputFile.score,
                },
            }, {
                upsert: false,
            });
    }
    console.log("done");
    process.exit(0);
}).catch((err) => {
    console.log(err);
});
