import * as React from "react";
import { AppViewProps } from "../modules/App";
import { MatchLabelBrowser } from "./MatchLabelBrowser";
import { Navigation, NavigationProps } from "./Navigation";
import { PostBrowser } from "./PostBrowser";
import { ProjectBrowser } from "./ProjectBrowser";

export class AppView extends React.Component<AppViewProps, {}> {
    constructor(props: AppViewProps) {
        super(props);
    }
    public render() {
        let body = null;
        switch (this.props.content.mode) {
            case "projectList":
                body = <ProjectBrowser {...this.props.content} />;
                break;
            case "postList":
                body = <PostBrowser {...this.props.content} />;
                break;
            case "matchEntry":
                body = <MatchLabelBrowser {...this.props.content} />;
                break;
            default:
                break;
        }
        return <div>
            <Navigation {...this.props.nav} />
            {body}
        </div >;
    }
}
