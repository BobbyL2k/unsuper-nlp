import "bootstrap";
import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./modules/App";
import "./style.css";

export const global = {
    userId: (function getUsername() {
        const username = document.cookie.split(";")[0].split("=")[1];
        console.log(document.cookie, username);
        return username;
    })(),
};

(function startup() {

    const appViewDomContainer = document.getElementById("app");
    if (appViewDomContainer === null) {
        return console.log("AppView dom container not found.");
    }

    const location = document.location.pathname;
    console.log("location.pathname", location);

    const app = new App(location, appViewDomContainer);

    {// Redirection Capture
        appViewDomContainer.addEventListener("click", (event) => {
            const targetElement = event.target as HTMLAnchorElement;
            if (targetElement.tagName === "A" && targetElement.href && event.button === 0
            ) {
                event.preventDefault();
                // console.log("Navigating to", targetElement.pathname);
                const path = targetElement.pathname;
                // console.log("path", path);
                if (path !== document.location.pathname) {
                    // console.log("Moved from", document.location.pathname, "to", path);
                    history.pushState(null, "", path);
                    app.onNewPath(path);
                } else {
                    console.log("User tried going to the same path");
                }
            }
        });

        window.onpopstate = (event) => {
            app.onNewPath(document.location.pathname);
        };
    }
})();
