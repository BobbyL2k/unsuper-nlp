import * as React from "react";
import { global } from "../index";
import { ProjectBrowser } from "./ProjectBrowser";

export type NavigationProps = {
    path: Array<{ label: string, href: string }>,
    currentPathIndex: number,
};
export type NavigationStates = {
};

export class Navigation extends React.Component<NavigationProps, NavigationStates> {
    constructor(props: NavigationProps) {
        super(props);
    }
    public render() {
        const path = this.props.path;
        const currentIndex = this.props.currentPathIndex;

        const dirs = [];
        for (let c = 0; c < path.length; c++) {
            if (c !== currentIndex) {
                dirs.push(<li key={path[c].label} className="nav-item">
                    <a className="nav-link" href={path[c].href}>{path[c].label}</a>
                </li>);
            } else {
                dirs.push(<li key={path[c].label} className="nav-item active">
                    <div className="nav-link">
                        <b>{path[c].label}</b>
                        <span className="sr-only">(current)</span>
                    </div>
                </li>);
            }
        }

        return <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarToggler">
                <a className="navbar-brand" href="/app">Social Listening</a>
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                    {dirs}
                </ul>
                <div className="my-2 my-lg-0">
                    <a className="btn btn-outline-success my-2 my-sm-0" href="/logout" >Logout of "{global.userId}"</a>
                </div>
            </div>
        </nav>;
    }
}
