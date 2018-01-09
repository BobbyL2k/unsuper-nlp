import "bootstrap";
import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as App from "./components/App";

function getUsername() {
    const username = document.cookie.split(';')[0].split('=')[1];
    console.log(document.cookie, username);
    return username;
}

export const global = {
    userId: getUsername(),
};

function startup() {
    const appDomContainer = document.getElementById("app");
    if (appDomContainer === null) { return console.log("App dom container not found."); }

    const renderPage = (location: string) => {
        ReactDOM.render(
            <App.App location={location} />,
            appDomContainer,
        );
    };

    appDomContainer.addEventListener("click", (event) => {
        const targetElement = event.target as HTMLAnchorElement;
        if (targetElement.tagName === "A" && targetElement.href && App.validPath(targetElement.pathname) &&
            event.button === 0
        ) {
            event.preventDefault();
            // console.log("Navigating to", targetElement.pathname);
            const targetValidPath = getValidPath(targetElement.pathname);
            // console.log("targetValidPath", targetValidPath);
            if (targetValidPath !== document.location.pathname) {
                // console.log("Moved from", document.location.pathname, "to", targetValidPath);
                history.pushState(null, "", targetValidPath);
                renderPage(targetValidPath);
            } else {
                console.log("User tried going to the same path");
            }
        }
    });

    window.onpopstate = (event) => {
        renderPage(document.location.pathname);
    };

    const validPath = getValidPath(document.location.pathname);
    if (validPath !== document.location.pathname) {
        console.log("Invalid path", document.location.pathname);
        console.log("Redirecting to validPath", validPath);
        history.pushState(null, "", validPath);
        renderPage(validPath);
    }
    renderPage(document.location.pathname);
}

startup();

function getValidPath(path: string) {
    if (path === "/app/project") {
        return "/app";
    } else {
        return path;
    }
}
