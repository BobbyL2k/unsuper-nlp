import * as React from "react";
import { global } from "../index";
import { ProjectBrowser } from "./ProjectBrowser";

export type NavigationProps = {
    path: string[],
};
export type NavigationStates = {
    oldPath: string[],
    path: string[] | never[],
    currentLocation: number,
};

export class Navigation extends React.Component<NavigationProps, NavigationStates> {
    constructor(props: NavigationProps) {
        super(props);
        this.state = {
            currentLocation: 0,
            path: [],
        } as Readonly<NavigationStates>;
    }
    public componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }
    public componentWillReceiveProps(nextProps: NavigationProps) {
        const oldPath = this.state.path;
        const newPath = nextProps.path;
        if (newPathIsNotSubSeq(oldPath, newPath)) {
            // console.log("found extend", newPath);
            this.setState({ path: newPath });
        }
    }
    public render() {
        const oldPath = this.state.path;
        const newPath = this.props.path;
        const dirs = [];
        for (let c = 0; c < oldPath.length; c++) {
            if (c !== newPath.length - 1) {
                const href = "/" + oldPath.slice(0, c + 1).join("/");
                dirs.push(<li key={oldPath[c]} className="nav-item">
                    <a className="nav-link" href={href}>{oldPath[c]}</a>
                </li>);
            } else {
                dirs.push(<li key={oldPath[c]} className="nav-item active">
                    <div className="nav-link">
                        <b>{oldPath[c]}</b>
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
                <a className="navbar-brand" href="#">Social Listening</a>
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0">{dirs}</ul>
                <div className="my-2 my-lg-0">
                    <a className="btn btn-outline-success my-2 my-sm-0" href="/logout" >Logout of "{global.userId}"</a>
                </div>
            </div>
        </nav>;
    }
}

function newPathIsNotSubSeq(oldPath: string[], newPath: string[]) {
    if (oldPath.length < newPath.length) { return true; }
    for (let c = 0; c < newPath.length; c++) {
        if (oldPath[c] !== newPath[c]) {
            return true;
        }
    }
    return false;
}
