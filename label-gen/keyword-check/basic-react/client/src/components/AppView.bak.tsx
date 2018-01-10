import * as React from "react";
import { AppStates } from "../modules/App";
import { DataMatchChecker } from "./DataMatchChecker";
import { Navigation } from "./Navigation";
import { ProjectBrowser } from "./ProjectBrowser";
import { ProjectDataBrowser } from "./ProjectDataBrowser";

export function validPath(path: string) {
    const pathStructure = getPathStructure(path);
    return pathStructure.length > 0 && pathStructure[0].toLowerCase() === "app";
}

export type AppViewStates = {
    lastProjectId: string,
    lastMatchId: string,
};

const Display = (props: { yes: boolean, children: any }) => {
    return <div style={{ display: props.yes ? "" : "none" }}>{props.children}</div>;
};

export class AppView extends React.Component<AppStates, AppViewStates> {
    constructor(props: AppStates) {
        super(props);
        this.state = {
            lastProjectId: "none",
        } as Readonly<AppViewStates>;
    }
    public componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }
    public componentWillReceiveProps(newProps: AppStates) {
        const path = getPathStructure(newProps.location);
        if (path[0] === "app" && path[1] === "project") {
            const projectId = path[2];
            // console.log("componentWillReceiveProps", projectId, this.state.lastProjectId);
            if (projectId !== undefined && projectId !== this.state.lastProjectId) {
                // console.log("setState");
                this.setState({ lastProjectId: projectId });
            }
            const matchId = path[3];
            // console.log("componentWillReceiveProps", matchId, this.state.lastMatchId);
            if (matchId !== undefined && matchId !== this.state.lastMatchId) {
                // console.log("setState");
                this.setState({ lastMatchId: matchId });
            }
        }
    }
    public render() {
        const path = getPathStructure(this.props.location);
        const displays: JSX.Element[] = [];

        const isApp = path[0] === "app";
        const isProject = isApp && path[1] === "project";

        const showProjectBrowser = path.length === 1 && isApp;
        displays.push(<Display key="ProjectBrowser" yes={showProjectBrowser}><ProjectBrowser /></Display>);

        const showProjectDataBrowser = path.length === 3 && isProject;
        displays.push(<Display key={this.state.lastProjectId} yes={showProjectDataBrowser}>
            <ProjectDataBrowser projectId={this.state.lastProjectId} />
        </Display>);

        const showDataMatchChecker = path.length === 4 && isProject;
        displays.push(<Display key={this.state.lastMatchId} yes={showDataMatchChecker}>
            <DataMatchChecker matchId={this.state.lastMatchId} />
        </Display>);

        return <div>
            <Navigation path={path} />
            <div className="container">{displays}</div>
        </div >;
    }
}

function getPathStructure(path: string) {
    return path.split("/").filter((elem) => elem.length !== 0);
}
