import * as express from "express";

const router = express.Router();

router.use(express.static(
    __dirname + "/" +
    "./../../../client/page/"));

export default router;
