import * as React from "react";
import { AppViewProps } from "../modules/App";
import { Navigation, NavigationProps } from "./Navigation";
import { ProjectBrowser } from "./ProjectBrowser";

export class AppView extends React.Component<AppViewProps, {}> {
    constructor(props: AppViewProps) {
        super(props);
    }
    public render() {
        let body = null;
        if (this.props.content.mode === "projectList") {
            body = <ProjectBrowser {...this.props.content} />;
        }
        return <div>
            <Navigation {...this.props.nav} />
            {body}
        </div >;
    }
}
