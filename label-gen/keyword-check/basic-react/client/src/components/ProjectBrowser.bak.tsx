import * as $ from "jquery";
import * as React from "react";

export type ProjectBrowserState = {
    projectIndex: Array<{
        A_ID: string,
        C_PROJECT_NAME: string,
        totalCount: number,
        labelCount: number,
    }> | undefined;
};

export class ProjectBrowser extends React.Component<{}, ProjectBrowserState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            projectIndex: undefined,
        } as Readonly<ProjectBrowserState>;
    }
    public async componentWillMount() {
        const projectIndex = await $.getJSON("/api/project-index");
        console.log("loaded projectIndex", projectIndex);
        this.setState({ projectIndex });
    }
    public render() {
        const rows = [];
        if (this.state.projectIndex !== undefined) {
            for (const entry of this.state.projectIndex) {
                rows.push(
                    <tr key={entry.A_ID}>
                        <th scope="row">
                            <a href={`/app/project/${entry.A_ID}`}>
                                {entry.A_ID}
                            </a>
                        </th>
                        <td>
                            <a href={`/app/project/${entry.A_ID}`}>
                                "{entry.C_PROJECT_NAME}"
                            </a>
                        </td>
                        <td>
                            {entry.totalCount}
                        </td>
                        <td>
                            {entry.labelCount} ({entry.labelCount / entry.totalCount}%)
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
                    <th scope="col">A_ID</th>
                    <th scope="col">C_PROJECT_NAME</th>
                    <th scope="col">Data Count</th>
                    <th scope="col">Data Labeled</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>;
    }
}
