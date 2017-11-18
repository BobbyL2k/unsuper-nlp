import "bootstrap";
import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { withRouter } from "react-router";
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom";

import { DataBrowser, DataBrowserProps } from "./components/DataBrowser";
import { ProjectBrowser } from "./components/ProjectBrowser";

type Data = { projectIndex: DataBrowserProps["projectIndex"] };

function startup() {
    const data: Data = {
        projectIndex: undefined,
    };
    load(data);
    $.getJSON("/api/project-index", (projectIndex) => {
        data.projectIndex = projectIndex;
        console.log("loaded new data", data.projectIndex);
        load(data);
    });
}

const App = withRouter((props: { data: Data, location: { pathname: string } }) => {
    const path = props.location.pathname.split("/");
    const dirs = [];
    for (let c = 0; c < path.length; c++) {
        if (c !== path.length - 1) {
            const href = path.slice(0, c + 1).join("/");
            dirs.push(<li className="nav-item">
                <Link className="nav-link" to={href}>{path[c]}</Link>
            </li>);
        } else {
            dirs.push(<li className="nav-item active">
                <div className="nav-link">
                    {path[c]}
                    <span className="sr-only">(current)</span>
                </div>
            </li>);
        }
    }
    return <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarToggler">
                <a className="navbar-brand" href="#">Social Listening</a>
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0">{dirs}</ul>
                <div className="my-2 my-lg-0">
                    <a className="btn btn-outline-success my-2 my-sm-0" href="/logout" >Logout</a>
                </div>
            </div>
        </nav>
        <div>
            <Switch>
                <Route exact path="/data-browser">
                    <DataBrowser projectIndex={props.data.projectIndex} />
                </Route>
                <Route path="/data-browser/:projectId" component={ProjectBrowser}>
                    <DataBrowser projectIndex={props.data.projectIndex} />
                </Route>
                <Redirect from="/" to="/data-browser" />
            </Switch>
        </div>
    </div >;
});

function load(data: Data) {
    ReactDOM.render(
        <BrowserRouter basename="/app">
            <App data={data} />
        </BrowserRouter>,
        document.getElementById("app"),
    );
}

startup();
