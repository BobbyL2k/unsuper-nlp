import * as express from "express";
import * as fs from "fs";
import { ContentsModel, MatchesModel } from "../db";

export type ProjectIndex = Array<{
    A_ID: string,
    C_PROJECT_NAME: string,
    labelCount: number,
    totalCount: number,
}>;

const router = express.Router();

const projectIndex: { [key: string]: object } = JSON.parse(
    fs.readFileSync(
        __dirname + "/" +
        "./../../../../../../data/json/parsed/homedottech.json",
    )
        .toString());

// router.use((req, res, next) => {
//     console.log("API called");
//     next();
// });

router.get("/project-index", (req, res) => {
    Promise
        .all(Object.keys(projectIndex).map(async (key) => {
            const entry: any = projectIndex[key];
            return {
                A_ID: entry.A_ID,
                C_PROJECT_NAME: entry.C_PROJECT_NAME,
                labelCount: 0,
                totalCount: await MatchesModel.count({ projectId: entry.A_ID }),
            };
        }))
        .then((projectIndexEntries) => {
            res.send(projectIndexEntries);
        })
        .catch((err) => {
            console.error("API/project-index Error", err);
        });
});

router.get("/project/:projectId", (req, res) => {
    console.log("projectId", req.params.projectId);
    MatchesModel.find({
        projectId: req.params.projectId,
    }).then(async (entries) => {
        const result = await Promise.all(entries.map(async (entry) => {
            const contentId = entry.get("contentId").split("-");
            const content = await ContentsModel.findOne({
                id: contentId[0],
            });
            // console.log(content, contentId);
            return {
                matchId: entry.get("matchId"),
                title: content ? content.get("title") : "Not Found",
                source: content ? content.get("source") : "",
                labeled: false,
            };
        }));
        return result;
    }).then((result) => {
        res.send(result);
    });
});

router.get("/data/match/:matchId", (req, res) => {
    console.log("matchId", req.params.matchId);
    (async () => {
        const match = await MatchesModel.findOne({
            matchId: req.params.matchId,
        });
        console.log(match);
        if (match === null) {
            throw new Error("");
        }
        const content = await ContentsModel.findOne({
            id: match.contentId.split("-")[0],
        });
        const validation = [];
        if (match.label === undefined) {
            match.label = {};
        }
        console.log(match.label);
        for (const userLabeledId of Object.keys(match.label)) {
            validation.push({
                userId: userLabeledId,
                isValid: match.label[userLabeledId].isValid,
            });
        }
        return {
            data: {
                dataId: content.id,
                title: content.title,
                content: content.post,
                source: content.source,
            },
            project: {
                projectId: match.projectId,
                projectName: projectIndex[match.projectId].C_PROJECT_NAME,
            },
            match: {
                matchId: match.matchId,
                start: match.from,
                end: match.to,
            },
            validation,
        };
    })()
        .then((result) => {
            res.send(result);
        });
});

router.post("/mark-match/:matchId", async (req, res) => {
    console.log(req.params.matchId, req.body);
    const match = await MatchesModel.findOne({ matchId: req.params.matchId });
    if (match === null) {
        res.send({
            success: false,
            message: "match not found",
        });
    } else if (req.session === undefined) {
        res.send({
            success: false,
            message: "session error",
        });
    } else {
        let label = match.get("label");
        if (label === undefined) {
            label = {};
        }
        label[req.session.user] = {
            isValid: req.body.isValid === "true",
        };
        console.log("new label", label);
        match.label = label;
        match.markModified("label");
        console.log(await match.save());
    }

    res.send(true);
});

export default router;
