import * as $ from "jquery";
import * as React from "react";
import { ProjectListContent } from "../modules/App";

export type ProjectBrowserProps = ProjectListContent;

export class ProjectBrowser extends React.Component<ProjectBrowserProps, {}> {
    constructor(props: ProjectBrowserProps) {
        super(props);
    }
    public render() {
        console.log(this.props, JSON.stringify(this.props));
        const rows = [];
        if (this.props.dObjResult.status === "done") {
            for (const entry of this.props.dObjResult.data) {
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
            if (this.props.dObjResult.data.length === 0) {
                rows.push(<tr key={0}>
                    <th scope="row"></th>
                    <td>Empty</td>
                    <td></td>
                    <td></td>
                </ tr>);
            }
        } else if (this.props.dObjResult.status === "loading") {
            rows.push(<tr key={0}>
                <th scope="row"></th>
                <td>Loading</td>
                <td></td>
                <td></td>
            </ tr>);
        } else if (this.props.dObjResult.status === "failed") {
            rows.push(<tr key={0}>
                <th scope="row"></th>
                <td>Failed to load</td>
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
