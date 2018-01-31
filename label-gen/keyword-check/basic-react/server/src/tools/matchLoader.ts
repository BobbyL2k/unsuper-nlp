import * as assert from "assert";
import * as fs from "fs-extra";
import * as minimist from "minimist";
import { connectDb } from "../nlp-db";

const argv = minimist(process.argv.slice(2));

assert(argv._.length === 1, "Need 1 file argument (metadata)");

connectDb(async (contents, projects) => {
    const filePath = argv._[0];
    const inputFiles = (await fs.readFile(filePath)).toString().split("\n");
    let entry = 0;
    let success = 0;
    for (const file of inputFiles) {
        if (file.length === 0) {
            return;
        }
        const obj = JSON.parse(file);
        const set: any = {};
        const contentId = obj.contentId; //.split("/").join("-");
        set[`matches.${contentId}-${obj.from}-${obj.to}-${obj.projectId}`] = {
            contentId,
            projectId: obj.projectId,
            from: obj.from,
            to: obj.to,
            distance: obj.distance,
            matched: obj.matched,
        };
        const result = await projects.findOneAndUpdate(
            {
                id: obj.projectId,
            }, {
                $set: set,
            });

        if (result.lastErrorObject.updatedExisting === true) {
            success++;
        }
        console.log(`ran ${++entry}`);
    }
    console.log(`${success} entries made out of ${entry}`);
    console.log(`Rate ${Math.round(success / entry * 100)}%`);
});
