import * as express from "express";
import * as fs from "fs";

const router = express.Router();

router.use(express.static(
    __dirname + "/" +
    "./../../../client/page/"));

export default router;
