import * as cheerio from "cheerio";
import * as express from "express";
import { connectDb, ProjectSchema } from "../nlp-db";
import * as pantip from "../tools/pantip";

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

// router.get("/data/content-pantip-post/:topicId", (req, res) => {
//     connectDb(async (contents, projects) => {
//         const topicId = req.params.topicId.toString();
//         const contentId = `${topicId}/post`;
//         console.log("contentId", contentId);
//         let content = await contents.findOne({
//             id: contentId,
//         });

//         if (content === null) {
//             console.log("Not found, need to load content");
//             try {
//                 const html = await pantip.loadPageHtml(topicId);
//                 const $ = cheerio.load(html);
//                 const title = $(".display-post-title").text().trim();
//                 const post = $(".display-post-story:not(.main-comment)").text().trim();
//                 const time = $(".display-post-timestamp abbr").attr("data-utime");

//                 if (post.length === 0) {
//                     throw Error("unable to fetch content from pantip");

//                 }
//                 content = {
//                     id: contentId,
//                     text: post,
//                     info: { title, time, source: "pantip" },
//                 };

//                 const dbResult = await contents.insertOne(content);
//                 if (dbResult.result.ok !== 1) {
//                     throw Error(`Database not acknowledged ${dbResult}`);
//                 }
//             } catch (err) {
//                 throw Error(`Error fetching content from pantip ${err}`);
//             }

//         }

//         res.send(content);
//     }).catch((err) => {
//         console.log(err);
//         res.status(500).send(err.toString());
//     });
// });

router.post("/data/mark-content/:topicId/:contentType", (req, res) => {
    if (req.session === undefined || req.session.user === undefined) {
        return res.send({
            success: false,
            message: "session error",
        });
    }

    console.log(req.body);

    connectDb(async (contents, projects) => {
        const content = await contents.findOne({
            id: `${req.params.topicId}/${req.params.contentType}`,
        });

        if (content === null) {
            throw Error(`content not found with id ${req.params.topicId}/${req.params.contentType}`);
        }

        const [type, from, to] = req.body.tag.toString().split("-");
        if (type === "text") {
            const serverGot = content.text.slice(from, to);
            const verifyStr = req.body.verify.toString();
            if (serverGot !== verifyStr) {
                throw Error(`Verification failed "${serverGot}" !== ${verifyStr}`);
            }
        } else {
            throw Error(`param type "${type}" not supported`);
        }
        const topicId = req.params.topicId.toString();
        const contentType = req.params.contentType.toString();
        const contentId = `${topicId}/${contentType}`;
        console.log("contentId", contentId);
        const $set: any = {};
        $set[`tag.${type}-${from}-${to}`] = true;
        const dbResult = await contents.findOneAndUpdate(
            {
                id: contentId,
            }, { $set });

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

export default router;
