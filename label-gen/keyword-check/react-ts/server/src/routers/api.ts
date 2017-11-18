import * as express from "express";
import * as fs from "fs";

export type DataEntries = Array<{
    A_ID: string,
    C_PROJECT_NAME: string,
    labelCount: number,
    totalCount: number,
}>;

const router = express.Router();

const projectIndex = JSON.parse(
    fs.readFileSync(
        __dirname +
        "/" +
        "./../../../../../../data/json/parsed/homedottech.json",
    ).toString());
const dataEntries: DataEntries = [];
for (const key in projectIndex) {
    const entry = projectIndex[key];
    dataEntries.push({
        A_ID: entry.A_ID,
        C_PROJECT_NAME: entry.C_PROJECT_NAME,
        labelCount: 0,
        totalCount: 0,
    });
}

// router.use((req, res, next) => {
//     console.log("API called");
//     next();
// });

router.get("/project-index", (req, res) => {
    // console.log("Test");
    res.send(dataEntries);
});

export default router;
