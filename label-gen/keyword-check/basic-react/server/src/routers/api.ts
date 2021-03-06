// import * as cheerio from "cheerio";
import * as express from "express";
import { connectDb, ContentSchema, DomainValue, ProjectSchema } from "../nlp-db";
import * as apiTags from "./api/tags";
// import * as pantip from "../tools/pantip";

export type ProjectIndex = Array<{
    A_ID: string,
    C_PROJECT_NAME: string,
    labelCount: number,
    totalCount: number,
}>;

const router = express.Router();

// router.use((req, res, next) => {
//     console.log("API called");
//     next();
// });

router.get("/project-index", (req, res) => {
    function filterObj<T>(obj: { [key: string]: T }, func: (elem: T) => boolean) {
        const result: { [key: string]: T } = {};
        for (const key of Object.keys(obj)) {
            if (func(obj[key])) {
                result[key] = obj[key];
            }
        }
        return result;
    }

    connectDb(async (contents, projects) => {
        const databaseEntries = await projects
            .find({})
            .project({ "_id": 0, "id": 1, "info.C_PROJECT_NAME": 1, "matches": 1 })
            .toArray();

        res.send(databaseEntries.map((project: ProjectSchema) => {
            const matches = project.matches === undefined ? {} : project.matches;
            return {
                A_ID: project.id,
                C_PROJECT_NAME: project.info.C_PROJECT_NAME,
                totalCount: Object.keys(matches).length,
                labelCount: Object.keys(filterObj(matches, (elem: typeof matches["key"]) => {
                    const label = elem.label === undefined ? {} : elem.label;
                    return Object.keys(label).length !== 0;
                })).length,
            };
        }));
    }).catch((err) => {
        res.status(500).send(err.toString());
    });
});

router.get("/project/:projectId", (req, res) => {
    console.log("projectId", req.params.projectId);
    connectDb(async (contents, projects) => {
        const project = await projects.findOne({ id: req.params.projectId.toString() });
        if (project === null) {
            res.status(500).send(`Error project "${req.params.projectId}" not found`);
        } else {
            const matches = project.matches === undefined ? {} : project.matches;
            const matchIds = Object.keys(matches);
            const contentsQueryResult = await Promise.all(matchIds.map((key) => {
                return contents.findOne({ id: matches[key].contentId });
            }));
            const result = [];
            for (let c = 0; c < matchIds.length; c++) {
                const matchId = matchIds[c];
                const contentResult = contentsQueryResult[c];
                let label = matches[matchId].label;
                if (label === undefined) {
                    label = {};
                }
                const labeled = Object.keys(label).length > 0;
                result.push({
                    matchId,
                    title: contentResult === null ? "Content Not Found" : contentResult.info.title,
                    source: contentResult === null ? "" : contentResult.info.source,
                    labeled,
                });
            }
            res.send(result);
        }
    }).catch((err) => {
        res.status(500).send(err.toString());
    });
});

router.get("/data/match/:contentId/:partialMatchId", (req, res) => {
    connectDb(async (contents, projects) => {
        const matchId = req.params.contentId.toString() + "/" + req.params.partialMatchId.toString();
        console.log("matchId", matchId);
        const matchIdParts = matchId.split("-");
        if (matchIdParts.length !== 4) {
            throw Error(`Invalid request of "${matchIdParts}"`);
        }

        const project = await projects.findOne({
            id: matchIdParts[3],
        });
        if (project === null) {
            throw Error(`Project "${matchIdParts[3]}" not found`);
        }
        if (project.matches === undefined) {
            throw Error(`No matches exist for "${project.id}"`);
        }
        const matchEntry = project.matches[matchId];
        if (matchEntry === undefined) {
            throw Error(`Match with "${matchId}" not found`);
        }
        if (matchEntry.label === undefined) {
            matchEntry.label = {};
        }

        const content = await contents.findOne({
            id: matchIdParts[0],
        });
        if (content === null) {
            throw Error(`Content "${matchIdParts[0]}" not found`);
        }

        const validation = [];
        for (const userLabeledId of Object.keys(matchEntry.label)) {
            if (matchEntry.label[userLabeledId] !== undefined) {
                validation.push({
                    userId: userLabeledId,
                    isValid: matchEntry.label[userLabeledId].isValid,
                });
            }
        }

        res.send({
            data: {
                dataId: content.id,
                title: content.info.title,
                content: content.text,
                source: content.info.source,
            },
            project: {
                projectId: project.id,
                projectName: project.info.C_PROJECT_NAME,
            },
            match: {
                matchId,
                start: matchEntry.from,
                end: matchEntry.to,
            },
            validation,
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

router.post("/mark-match/:contentId/:partialMatchId", (req, res) => {
    if (req.session === undefined || req.session.user === undefined) {
        return res.send({
            success: false,
            message: "session error",
        });
    }

    connectDb(async (contents, projects) => {
        if (req.session === undefined || req.session.user === undefined) {
            throw Error(`Session Error ${JSON.stringify(req.session)}`);
        }
        const matchId = req.params.contentId.toString() + "/" + req.params.partialMatchId.toString();
        console.log("matchId", matchId);
        const matchIdParts = matchId.split("-");
        if (matchIdParts.length !== 4) {
            throw Error(`Invalid request of "${matchIdParts}"`);
        }

        const project = await projects.findOne({
            id: matchIdParts[3],
        });
        if (project === null) {
            throw Error(`Project "${matchIdParts[3]}" not found`);
        }
        if (project.matches === undefined) {
            throw Error(`No matches exist for "${project.id}"`);
        }
        const matchEntry = project.matches[matchId];
        if (matchEntry === undefined) {
            throw Error(`Match with "${matchId}" not found`);
        }

        const set: any = {};
        set[`matches.${matchId}.label.${req.session.user}`] = { isValid: req.body.isValid === "true" };

        await projects.findOneAndUpdate(
            {
                id: matchIdParts[3],
            }, {
                $set: set,
            });

        res.send(true);
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

// Content Tagger

router.get("/data/content/*?", (req, res) => {
    connectDb(async (contents, projects) => {
        let contentId;
        let content;
        if (req.params[0] !== undefined) {
            contentId = req.params[0].toString();
            console.log("contentId", contentId);
            content = await contents.findOne({
                id: contentId,
            });
        } else {
            console.log("No supplied contentId");
            content = await contents.findOne({});
        }
        if (content === null) {
            throw Error(`Content ${contentId} not found`);
        }
        res.send(content);
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

const userReserved: {
    tag: { [userId: string]: string },
    label: { [userId: string]: string },
} = {
        tag: {}, label: {},
    };
router.get("/data/untagged-content/*?", (req, res) => {
    connectDb(async (contents, projects) => {

        if (req.session === undefined || req.session.user === undefined) {
            throw Error("session error");
        }

        const loadedContents = (await contents
            .find({ tag: { $not: { $gt: {} } } })
            .sort({ score: -1 })
            .limit(Object.keys(userReserved.tag).length + 1)
            .toArray());

        let content: ContentSchema | null = null;
        for (const contentEntry of loadedContents) {
            let isReserved = false;
            for (const user of Object.keys(userReserved.tag)) {
                if (user !== req.session.user && userReserved.tag[user] === contentEntry.id) {
                    isReserved = true;
                    break;
                }
            }
            if (isReserved === false) {
                userReserved.tag[req.session.user] = contentEntry.id;
                content = contentEntry;
                break;
            }
        }
        if (content !== null) {
            res.send(content);
        } else {
            throw Error("No unlabeled content is found");
        }

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

router.get("/data/next-content/*?", (req, res) => {
    connectDb(async (contents, projects) => {
        const contentId = req.params[0].toString();
        console.log("contentId", contentId);
        const content = (await contents.find({
            id: { $lt: contentId },
        }).sort({ id: -1 }).limit(1).toArray())[0];
        if (content === null) {
            throw Error(`Content next to ${contentId} not found`);
        }
        res.send(content);
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

router.get("/data/prev-content/*?", (req, res) => {
    connectDb(async (contents, projects) => {
        const contentId = req.params[0].toString();
        console.log("contentId", contentId);
        const content = (await contents.find({
            id: { $gt: contentId },
        }).sort({ id: 1 }).limit(1).toArray())[0];
        if (content === null) {
            throw Error(`Content prev to ${contentId} not found`);
        }
        res.send(content);
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

router.post("/data/mark-content/*?", (req, res) => {

    console.log(req.body);

    connectDb(async (contents, projects) => {

        if (req.session === undefined || req.session.user === undefined) {
            res.send({
                success: false,
                message: "session error",
            });
            return;
        }

        const id = req.params[0].toString();
        const content = await contents.findOne({ id });
        if (content === null) {
            throw Error(`content not found with id ${id}`);
        }
        if (content.tag === undefined) {
            content.tag = {};
        }
        const tags = Object.keys(content.tag).filter((tagEntry: string) => {
            return tagEntry.split("-")[0] === "text";
        });

        const [type, from, to] = req.body.tag.toString().split("-");
        if (type !== "text") {
            throw Error(`param type "${type}" not supported`);
        }

        function tagStrToObj(str: string) {
            const [typeStr, fromStr, toStr] = str.split("-");
            if (typeStr !== "text") {
                throw Error(`Invalid Tag ${str}`);
            }
            return { from: parseInt(fromStr, 10), to: parseInt(toStr, 10), str };
        }

        function overlap(tagObjA: any, tagObjB: any) {
            return (
                tagObjA.from <= tagObjB.from && tagObjB.from < tagObjA.to ||
                tagObjA.from < tagObjB.to && tagObjB.to <= tagObjA.to ||
                tagObjB.from <= tagObjA.from && tagObjA.from < tagObjB.to ||
                tagObjB.from < tagObjA.to && tagObjA.to <= tagObjB.to
            );
        }

        const $set: any = {};
        const $unset: any = {};
        let option;
        const contentId = req.params[0].toString();
        console.log("contentId", contentId);
        if (from !== "none") {
            const serverGot = content.text.slice(from, to);
            const verifyStr = req.body.verify.toString();
            if (serverGot !== verifyStr) {
                throw Error(`Verification failed "${serverGot}" !== ${verifyStr}`);
            }

            const newTag = { from, to };
            for (const tag of tags.map(tagStrToObj)) {
                if (overlap(tag, newTag)) {
                    throw Error(`New Tag Overlap ${JSON.stringify(newTag)}`);
                }
            }

            $set[`tag.${type}-${from}-${to}`] = { user: req.session.user };
            $unset["tag.text-none"] = true;
            option = { $set, $unset };
        } else {
            if (tags.length === 0 || (tags.length === 1 && tags[0] === "text-none")) {
                $set["tag.text-none"] = { user: req.session.user };
                option = { $set };
            } else {
                throw Error("No Tag can't be used on contents already with a tag " + JSON.stringify(tags));
            }
        }

        const dbResult = await contents.findOneAndUpdate(
            {
                id: contentId,
            }, option);

        console.log("dbResult", dbResult);

        if (dbResult.ok !== 1) {
            throw Error(`Database not ok ${dbResult}`);
        }
        res.send({ ok: true });

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

router.post("/data/unmark-content/*?", (req, res) => {
    if (req.session === undefined || req.session.user === undefined) {
        return res.send({
            success: false,
            message: "session error",
        });
    }

    console.log(req.body);

    connectDb(async (contents, projects) => {
        const content = await contents.findOne({
            id: `${req.params[0]}`,
        });

        if (content === null) {
            throw Error(`content not found with id ${req.params[0]}`);
        }

        const contentId = req.params[0].toString();
        console.log("contentId", contentId);
        const $unset: any = {};
        $unset[`tag.${req.body.tag.toString()}`] = true;
        const dbResult = await contents.findOneAndUpdate(
            {
                id: contentId,
            }, { $unset });

        if (dbResult.ok !== 1) {
            throw Error(`Database not ok ${dbResult}`);
        }
        res.send({ ok: true });

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

// Content Labeler

router.get("/data/unlabeled-content/*?", (req, res) => {
    connectDb(async (contents, projects) => {

        if (req.session === undefined || req.session.user === undefined) {
            throw Error("session error");
        }

        const loadedContents = (await contents
            .find({
                "tag": { $gt: {} },
                "tag.text-none": { $exists: false },
                "label.sentiment": { $exists: false },
            })
            .sort({ id: -1 })
            .limit(Object.keys(userReserved.label).length + 1)
            .toArray());

        let content: ContentSchema | null = null;
        for (const contentEntry of loadedContents) {
            let isReserved = false;
            for (const user of Object.keys(userReserved.label)) {
                if (user !== req.session.user && userReserved.label[user] === contentEntry.id) {
                    isReserved = true;
                    break;
                }
            }
            if (isReserved === false) {
                userReserved.label[req.session.user] = contentEntry.id;
                content = contentEntry;
                break;
            }
        }
        if (content !== null) {
            res.send(content);
        } else {
            throw Error("No unlabeled content is found");
        }

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

router.post("/data/label-content/*?", (req, res) => {

    console.log("/data/label-content/*?", req.body);

    connectDb(async (contents, projects) => {

        if (req.session === undefined || req.session.user === undefined) {
            res.send({
                success: false,
                message: "session error",
            });
            return;
        }

        const id = req.params[0].toString();
        const content = await contents.findOne({ id });
        if (content === null) {
            throw Error(`content not found with id ${id}`);
        }
        if (content.label === undefined) {
            content.label = {};
        }

        const domain = req.body.domain.toString();
        const value = req.body.value.toString();
        if (domain !== DomainValue.sentiment.str) {
            throw Error(`param domain "${domain}" not supported`);
        }
        if (Object.keys(DomainValue.sentiment.value).find((v) => v === value) === undefined) {
            throw Error(`param value "${value}" not supported`);
        }

        const $set: any = {};
        $set[`label.${DomainValue.sentiment.str}`] = { user: req.session.user, value };
        const option = { $set };

        const dbResult = await contents.findOneAndUpdate({ id }, option);

        console.log("dbResult", dbResult);

        if (dbResult.ok !== 1) {
            throw Error(`Database not ok ${dbResult}`);
        }
        res.send({ ok: true });

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

// Content Creator

router.post("/data/create-content/", (req, res) => {

    console.log(req.body);

    connectDb(async (contents, projects, users) => {
        if (req.session === undefined || req.session.user === undefined) {
            throw Error(`Session Error ${JSON.stringify(req.session)}`);
        }

        const user = await users.findOneAndUpdate(
            {
                id: req.session.user,
            }, {
                $setOnInsert: {
                    id: req.session.user,
                },
                $inc: { lastEntryIndex: 1 },
            }, {
                upsert: true,
                returnOriginal: false,
            });

        console.log("user", user);

        if (user.value === undefined || user.value.lastEntryIndex === undefined) {
            throw Error("Error retrieving id");
        }

        const text: string = req.body.text.toString();
        const url: string = req.body.url;
        const id: string = `${req.session.user}/${user.value.lastEntryIndex}`;
        const content: ContentSchema = { id, text, info: { url } };

        console.log("content", content);

        const dbResult = await contents.insertOne(content);

        // console.log("dbResult", dbResult.result);

        if (dbResult.result.ok !== 1) {
            throw Error(`Database not ok ${dbResult}`);
        }
        res.send({ ok: true, id });

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

// Other

router.get("/status/", (req, res) => {

    console.log(req.body);

    connectDb(async (contents, projects, users) => {
        if (req.session === undefined || req.session.user === undefined) {
            throw Error(`Session Error ${JSON.stringify(req.session)}`);
        }

        const total = await contents.find({}).count();
        const labeled = await contents.find({ $and: [{ tag: { $gt: {} } }] }).count();
        const containsNE = await contents.find(
            {
                $and: [
                    { "tag.text-none": { $exists: false } },
                    { tag: { $gt: {} } },
                ],
            }).count();

        const sentimentLabeledContents = await contents.find(
            {
                "tag": { $exists: true },
                "tag.text-none": { $exists: false },
                "tags": { $gt: {} },
            }, {
                projection: {
                    tags: 1,
                },
            },
        ).toArray();
        // console.log("sentimentLabeledContents", sentimentLabeledContents);
        const tagsFilter = (tagType: string) => {
            return (e: any) => e.tags !== undefined && e.tags[tagType] !== undefined;
        };
        const sentimentLabeled = sentimentLabeledContents.length;
        const posCount = sentimentLabeledContents.filter(tagsFilter("pos")).length;
        const negCount = sentimentLabeledContents.filter(tagsFilter("neg")).length;
        const questionCount = sentimentLabeledContents.filter(tagsFilter("question")).length;
        const feedbackCount = sentimentLabeledContents.filter(tagsFilter("feedback")).length;
        const noneCount = sentimentLabeledContents.filter(tagsFilter("none")).length;

        const roundNumber = (num: number) => {
            return Math.round(num * 10000) / 100;
        };

        const result = {
            overall: {
                total,
                labeled,
                unlabeled: total - labeled,
                percentage: roundNumber(labeled / total),
            },
            labeled: {
                total: labeled,
                containsNE,
                empty: labeled - containsNE,
                percentage: roundNumber(containsNE / labeled),
            },
            sentiment: {
                overall: {
                    labeled: sentimentLabeled,
                    percentage: roundNumber(sentimentLabeled / containsNE),
                },
                empty: {
                    count: noneCount,
                    percentage: roundNumber(noneCount / sentimentLabeled),
                },
                positive: {
                    count: posCount,
                    percentage: roundNumber(posCount / sentimentLabeled),
                },
                negative: {
                    count: negCount,
                    percentage: roundNumber(negCount / sentimentLabeled),
                },
                feedback: {
                    count: feedbackCount,
                    percentage: roundNumber(feedbackCount / sentimentLabeled),
                },
                question: {
                    count: questionCount,
                    percentage: roundNumber(questionCount / sentimentLabeled),
                },
            },
        };

        res.send(result);

    }).catch((err) => {
        console.log(err);
        res.status(500).send(err.toString());
    });
});

// Sentiment

router.use("/tags", apiTags.createRouter(connectDb));

export default router;
