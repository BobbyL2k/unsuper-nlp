import * as bcrypt from "bcrypt";
import * as time from "clean-time";
import * as connectMongo from "connect-mongo";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as session from "express-session";
import * as fs from "fs";
import { UsersModel } from "./db";

const auth = () => {

    const router = express.Router();

    router.use(cookieParser());

    const MongoStore = connectMongo(session);

    router.use(session({
        cookie: { maxAge: time(1).day(12).hours() },
        resave: false,
        saveUninitialized: false,
        secret: "eieigum",
        store: new MongoStore({ url: "mongodb://localhost/unsuper-nlp" }),
    }));

    const registerFile = fs.readFileSync(__dirname + "/" + "./../../client/public/register.html").toString();
    router.get("/register", (req, res) => {
        if (req.session && req.session.login) {
            res.redirect("/app/");
        } else {
            res.send(registerFile);
        }
    });
    router.post("/register", async (req, res) => {
        if (/^[a-z0-9]+$/i.test(req.body.lg_username) !== true) {
            res.send("The username must only contains a-z, A-Z, or numbers (0-9) characters.");
        } else if (req.body.lg_password !== req.body.cn_password) {
            res.send("The confirmation password do not match!");
        } else if (null !== await UsersModel.findOne({ id: req.body.lg_username })) {
            res.send("The username has been taken!");
        } else {
            const user = new UsersModel({
                id: req.body.lg_username,
                password: await bcrypt.hash(req.body.lg_password, 13),
            });
            await user.save();
            res.redirect("/login");
        }
    });

    async function authenticate(username: string, password: string) {
        const user = await UsersModel.findOne({ id: username });
        if (user === null) {
            return undefined;
        } else if (await bcrypt.compare(password, user.get("password")) === false) {
            return undefined;
        } else {
            return user.get("id");
        }
    }

    const loginFile = fs.readFileSync(__dirname + "/" + "./../../client/public/login.html").toString();
    router.get("/login", (req, res) => {
        if (req.session && req.session.login) {
            res.redirect("/");
        } else {
            res.send(loginFile);
        }
    });
    router.post("/login", async (req, res) => {
        if (req.session) {
            req.session.user = await authenticate(req.body.lg_username, req.body.lg_password);
            if (req.session.user !== undefined) {
                req.session.login = true;
                res.cookie("user", req.session.user);
                res.redirect("/");
            } else {
                res.send("Authentication failed, the username and/or password do not match any record!");
            }
        } else {
            res.send("Session Error, please try again!");
        }
    });

    //
    router.get("/logout", (req, res) => {
        if (req.session) {
            req.session.login = false;
        }
        res.redirect("/login");
    });

    router.use((req, res, next) => {
        if (req.session && req.session.login) {
            next();
        } else {
            res.redirect("/login");
        }
    });

    return router;
};

export default auth;
