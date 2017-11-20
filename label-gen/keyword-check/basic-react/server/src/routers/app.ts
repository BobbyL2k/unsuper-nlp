import * as express from "express";
import * as fs from "fs";

const router = express.Router();

const indexFile = fs.readFileSync(__dirname + "/" + "./../../../client/public/index.html").toString();
router.get("*", (req, res) => {
    res.send(indexFile);
});

export default router;
