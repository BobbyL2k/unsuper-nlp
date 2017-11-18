import * as React from "react";
import { Link } from "react-router-dom";

export type DataBrowserProps = {
    projectIndex: Array<{
        A_ID: string,
        C_PROJECT_NAME: string,
        totalCount: number,
        labelCount: number,
    }> | undefined;
};

export class DataBrowser extends React.Component<DataBrowserProps, {}> {
    public render() {
        const rows = [];
        if (this.props.projectIndex !== undefined) {
            for (const entry of this.props.projectIndex) {
                rows.push(
                    <tr key={entry.A_ID}>
                        <th scope="row">
                            <Link to={`/data-browser/${entry.A_ID}`}>
                                {entry.A_ID}
                            </Link>
                        </th>
                        <td>
                            <Link to={`/data-browser/${entry.A_ID}`}>
                                "{entry.C_PROJECT_NAME}"
                            </Link>
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
