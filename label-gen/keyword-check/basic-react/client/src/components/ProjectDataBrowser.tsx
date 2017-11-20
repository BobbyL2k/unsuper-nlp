import * as $ from "jquery";
import * as React from "react";

export type ProjectDataBrowserProps = {
    projectId: string,
};

export type ProjectDataBrowserStates = {
    projectData: Array<{
        matchId: string,
        title: string,
        source: string,
        labeled: boolean,
    }> | undefined;
};

export class ProjectDataBrowser extends React.Component<ProjectDataBrowserProps, ProjectDataBrowserStates> {
    constructor(props: ProjectDataBrowserProps) {
        super(props);
        this.state = {
            projectData: undefined,
        } as Readonly<ProjectDataBrowserStates>;
    }
    public async componentWillMount() {
        console.log("loading projectData for", this.props.projectId);
        const projectData = await $.getJSON(`/api/project/${this.props.projectId}`);
        console.log("loaded projectData for", this.props.projectId, projectData);
        this.setState({ projectData });
    }
    public render() {
        const rows = [];
        if (this.state.projectData !== undefined) {
            for (const entry of this.state.projectData) {
                rows.push(
                    <tr key={entry.matchId}>
                        <th scope="row">
                            <a href={`/app/project/${this.props.projectId}/${entry.matchId}`}>
                                {entry.matchId}
                            </a>
                        </th>
                        <td>
                            <a href={`/app/project/${this.props.projectId}/${entry.matchId}`}>
                                "{entry.title}"
                            </a>
                        </td>
                        <td>
                            {entry.source}
                        </td>
                        <td>
                            {entry.labeled}
                        </td>
                    </tr>,
                );
            }
        } else {
            rows.push(<tr key={0}>
                <th scope="row"></th>
                <td>Loading</td>
                <td></td>
                <td></td>
            </ tr>);
        }
        return <table className="table">
            <thead>
                <tr>
                    <th scope="col">matchId</th>
                    <th scope="col">Title</th>
                    <th scope="col">Source</th>
                    <th scope="col">Labeled</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>;
    }
}
