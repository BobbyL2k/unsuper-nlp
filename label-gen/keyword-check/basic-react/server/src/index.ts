import * as bodyParser from "body-parser";
import * as connectMongo from "connect-mongo";
import * as express from "express";
import * as session from "express-session";
import * as fs from "fs";
import * as http from "http";
import routerApi from "./routers/api";
import routerApp from "./routers/app";

const portNumber = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// const MongoStore = connectMongo(session);

// app.use(session({
//     cookie: { maxAge: 60000 },
//     resave: false,
//     saveUninitialized: false,
//     secret: "eieigum",
//     store: new MongoStore(),
// }));

// Serve Assets
app.use("/asset", express.static(__dirname + "/" + "./../../client/build", { fallthrough: true }));

app.use((req, res, next) => {
    console.log("request", req.url);
    next();
});

// // Authentication
// const loginFile = fs.readFileSync(__dirname + "/" + "./../../client/public/login.html").toString();
// app.get("/login", (req, res) => {
//     if (req.session.login) {
//         res.redirect("/app/");
//     } else {
//         res.send(loginFile);
//     }
// });
// app.post("/login", (req, res) => {
//     if (req.body.lg_username === "home.tech" && req.body.lg_password === "tech.home") {
//         req.session.login = true;
//         res.redirect("/app/");
//     } else {
//         res.send("Failed, try again!");
//     }
// });

// //
// app.get("/logout", (req, res) => {
//     req.session.login = false;
//     res.redirect("/login");
// });

// app.use((req, res, next) => {
//     if (req.session.login) {
//         next();
//     } else {
//         return next();
//         res.redirect("/login");
//     }
// });

// Redirect default path to App
app.get("/", (req, res) => {
    res.redirect("/app/");
});

// Serve App
app.use("/app/", routerApp);

app.use("/api/", routerApi);

const server = http.createServer(app);

server.on("listening", () => {
    console.log(`Listening on port ${portNumber}`);
});

server.listen(portNumber);
