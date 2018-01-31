import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as express from "express";
import * as http from "http";

import auth from "./auth";
import routerApi from "./routers/api";
import routerApp from "./routers/app";
import routerPage from "./routers/page";

const portNumber = 3000;

const app = express();

app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

// Serve Assets
app.use(
    "/asset",
    express.static(
        __dirname + "/" +
        "./../../client/build",
        { fallthrough: true }));

// Serve Static Files
app.use(
    "/public",
    express.static(
        __dirname + "/" +
        "./../../client/public",
        { fallthrough: true }));

app.use((req, res, next) => {
    console.log("request", req.url);
    next();
});

// Authentication
app.use(auth());

// Redirect default path to App
app.get("/", (req, res) => {
    res.redirect("/page/content-creater/");
});

// Serve App
app.use("/app/", routerApp);

app.use("/page/", routerPage);

app.use("/api/", routerApi);

const server = http.createServer(app);

server.on("listening", () => {
    console.log(`Listening on port ${portNumber}`);
});

server.listen(portNumber);
