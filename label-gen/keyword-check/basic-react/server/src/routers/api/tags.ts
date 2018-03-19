import { Request, Response, Router } from "express";
import { connectDbType } from "../../nlp-db";

function flush(src:any[], dest:any[]) {
    do {
        const entry = src.pop()
        if (entry === undefined) {
            break;
        }
        dest.push(entry);
    } while (true);
}

type Entry = {start: number, end: number};
function addEntry(entries: Entry[], newEntry: Entry) {
    if (newEntry.start === newEntry.end) {
        return;
    }
    const stack: Entry[] = [];
    flush(entries, stack);
    function canMerge(entryA: Entry, entryB: Entry) {
        if (entryA.start <= entryB.start && entryB.start <= entryA.end) {
            return true;
        }
        if (entryB.start <= entryA.start && entryA.start <= entryB.end) {
            return true;
        }
        return false;
    }
    function merge(entryA: Entry, entryB: Entry) {
        return {
            start: Math.min(entryA.start, entryB.start),
            end: Math.max(entryA.end, entryB.end),
        };
    }

    while (stack.length !== 0) {
        const top = stack.pop();
        if (top === undefined) {
            break;
        }
        if (canMerge(top, newEntry)) {
            newEntry = merge(top, newEntry);
            // reset stack
            flush(entries, stack);
        } else {
            entries.push(top);
        }
    }
    entries.push(newEntry);
    entries.sort((a, b) => a.start - b.start);
}

function removeEntry(entries: Entry[], newEntry: Entry) {
    if (newEntry.start === newEntry.end) {
        return;
    }
    const stack: Entry[] = [];
    flush(entries, stack);
    function isIntersecting(entryA: Entry, entryB: Entry) {
        if (entryA.start <= entryB.start && entryB.start < entryA.end) {
            return true;
        }
        if (entryB.start <= entryA.start && entryA.start < entryB.end) {
            return true;
        }
        return false;
    }
    function subtract(entryA: Entry, entryB: Entry) {
        const result = [];
        if (entryA.start < entryB.start) {
            result.push({
                start: entryA.start,
                end: entryB.start,
            });
        }
        if (entryB.end < entryA.end) {
            result.push({
                start: entryB.end,
                end: entryA.end,
            });
        }
        return result;
    }

    do {
        const top = stack.pop();
        if (top === undefined) {
            break;
        }
        if (isIntersecting(top, newEntry)) {
            const resultingTopEntries = subtract(top, newEntry);
            flush(resultingTopEntries, entries);
        } else {
            entries.push(top);
        }
    } while (true);
    entries.sort((a, b) => a.start - b.start);
}
export function createRouter(connectDb: connectDbType){
    const router = Router();

    router.get("/find/id/*?", function(req: Request, res: Response) {
        connectDb(async (contents) => {
            let contentId;
            let content;
            if (req.params[0] !== undefined) {
                contentId = req.params[0].toString();
                console.log("contentId", contentId);
                content = await contents.findOne({
                    "tag": { $gt: {} },
                    "tag.text-none": { $exists: false }, 
                    "id": contentId,
                });
            } else {
                throw Error("No supplied contentId");
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
        findUnlabeled: { [userId: string]: string },
    } = {
        findUnlabeled: {}
    };
    router.get("/find/first/", function (req: Request, res: Response) {
        connectDb(async (contents) => {
            let content;
            content = await contents.findOne({
                "tag": { $gt: {} },
                "tag.text-none": { $exists: false },
            }, { sort: { id: 1 } });
            if (content === null) {
                throw Error(`First content not found`);
            }
            res.send(content);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.toString());
        });
    });
    router.all("/find/unlabeled", function (req: Request, res: Response) {
        connectDb(async (contents) => {
            // Resolve User Id
            if (req.session === undefined || req.session.user === undefined) {
                throw Error("session error");
            }
            const currentUser = req.session.user;
            // Create Query Object per request
            const queryObj: any = {
                "tag": { $exists: true },
                "tag.text-none": { $exists: false },
                "tags": { $not: { $gt: {} } },
                // "$or": []
            };
            // Extract ignored tags type
            // const ignoreList: string[] =
            //     req.body.ignore !== undefined ?
            //         req.body.ignore.toString().split(",") :
            //         [];
            // if (ignoreList.indexOf("type") === -1) {
            //     queryObj.$or.push({ "tags.type": { $not: { $gt: {} } }, });
            // }
            // if (ignoreList.indexOf("sentiment") === -1) {
            //     queryObj.$or.push({ "tags.sentiment": { $not: { $gt: {} } }, });
            // }
            let unlabeledContents = await (contents
                .find(queryObj)
                .sort({ id: 1 })
                .limit(Object.keys(userReserved.findUnlabeled).length + 10)
                .toArray());
            // console.log("unlabeledContents", unlabeledContents);
            let content = null;
            for (const contentEntry of unlabeledContents) {
                let isReserved = false;
                for (const user of Object.keys(userReserved.findUnlabeled)) {
                    if (user !== currentUser && userReserved.findUnlabeled[user] === contentEntry.id) {
                        isReserved = true;
                        break;
                    }
                }
                if (isReserved === false) {
                    userReserved.findUnlabeled[currentUser] = contentEntry.id;
                    content = contentEntry;
                    break;
                }
            }
            if (content === null) {
                throw Error(`No unlabeled content found`);
            }
            res.send(content);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.toString());
        });
    });
    router.get("/find/prev-id/*?", function (req: Request, res: Response) {
        connectDb(async (contents) => {
            let contentId;
            let content;
            // TODO remove no contentId handling
            if (req.params[0] !== undefined) {
                contentId = req.params[0].toString();
                console.log("contentId", contentId);
                content = await contents.findOne({
                    "tag": { $gt: {} },
                    "tag.text-none": { $exists: false },
                    "id": { $lt: contentId },
                }, { sort: { id: -1 } });
            } else {
                console.log("No supplied contentId");
                content = await contents.findOne({});
            }
            if (content === null) {
                throw Error(`Content before ${contentId} not found`);
            }
            res.send(content);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.toString());
        });
    });
    router.get("/find/next-id/*?", function (req: Request, res: Response) {
        connectDb(async (contents) => {
            let contentId;
            let content;
            // TODO remove no contentId handling
            if (req.params[0] !== undefined) {
                contentId = req.params[0].toString();
                console.log("contentId", contentId);
                content = await contents.findOne({
                    "tag": { $gt: {} },
                    "tag.text-none": { $exists: false }, 
                    "id": { $gt:contentId },
                }, { sort: { id: 1 } });
            } else {
                console.log("No supplied contentId");
                content = await contents.findOne({});
            }
            if (content === null) {
                throw Error(`Content after ${contentId} not found`);
            }
            res.send(content);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.toString());
        });
    });

    router.post("/mark/id/*?", function(req: Request, res: Response) {
        connectDb(async (contents) => {
            let contentId;
            let content;
            if (req.params[0] !== undefined) {
                contentId = req.params[0].toString();
                console.log("contentId", contentId);
                content = await contents.findOne({
                    "tag": { $gt: {} },
                    "tag.text-none": { $exists: false }, 
                    "id": contentId,
                });
            } else {
                throw Error("No supplied contentId");
            }
            const allowedTypes = ["pos", "neg", "feedback", "question"];
            const type = req.body.type.toString();
            if(allowedTypes.indexOf(type) === -1){
                throw Error(`type ${type} not allowed`);
            }
            if (content === null) {
                throw Error(`Content ${contentId} not found`);
            }
            const tags = content.tags === undefined ? {} : content.tags;
            if(tags.none !== undefined){
                delete tags.none;
            }
            if(tags[type] === undefined){
                tags[type] = [];
            }
            const entries = tags[type];
            const newEntry = { start:parseInt(req.body.newEntry.start), end:parseInt(req.body.newEntry.end) };
            console.log("newEntry", newEntry);
            console.assert(!isNaN(newEntry.start) && !isNaN(newEntry.end), "entry provided is NaN");
            const value = req.body.value === "true";
            // console.log("body", req.body, "type", type, "value", value, "newEntry", newEntry);
            if (value === true) {
                addEntry(entries, newEntry);
            } else {
                removeEntry(entries, newEntry);
            }
            if(entries.length === 0 ){
                delete tags[type];
            }

            const $set: any = {};
            $set[`tags`] = tags;
            const result = await contents.findOneAndUpdate({ id: contentId }, { $set }, { returnOriginal: false });
            console.log("update result tags", content.tags);
            
            res.send(result.value);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.toString());
        });
    });

    router.post("/mark-empty/id/*?", function(req: Request, res: Response) {
        connectDb(async (contents) => {
            let contentId;
            let content;
            if (req.params[0] !== undefined) {
                contentId = req.params[0].toString();
                console.log("contentId", contentId);
                content = await contents.findOne({
                    "tag": { $gt: {} },
                    "tag.text-none": { $exists: false }, 
                    "id": contentId,
                });
            } else {
                throw Error("No supplied contentId");
            }
            if (content === null) {
                throw Error(`Content ${contentId} not found`);
            }
            const $set: any = {  };
            if(content.tags !== undefined && content.tags.none){
                $set.tags = { }
            }else{
                $set.tags = { none: true }
            }
            const result = await contents.findOneAndUpdate({ id: contentId }, { $set }, { returnOriginal: false });
            console.log("update result tags", $set.tags);
            
            res.send(result.value);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.toString());
        });
    });
    return router;
}
