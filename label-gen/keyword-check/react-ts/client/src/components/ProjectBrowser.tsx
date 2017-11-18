import * as React from "react";

export type ProjectBrowserProps = {
    match: {
        params: {
            projectId: string,
        },
    },
};

export class ProjectBrowser extends React.Component<ProjectBrowserProps, {}> {
    public render() {
        return <h1>Hello projectId {this.props.match.params.projectId}!</h1>;
    }
}
