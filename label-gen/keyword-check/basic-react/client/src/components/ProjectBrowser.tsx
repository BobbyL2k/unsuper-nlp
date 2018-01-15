import * as $ from "jquery";
import * as React from "react";
import { ProjectListContent } from "../modules/App";
import { TableView, TableViewProps } from "./TableView";

export type ProjectBrowserProps = ProjectListContent;

type Keys = "A_ID" | "C_PROJECT_NAME" | "totalCount" | "labelCount";

export class ProjectBrowser extends React.Component<ProjectBrowserProps, {}> {
    private lastSortedBy?: string;
    constructor(props: ProjectBrowserProps) {
        super(props);
    }
    public render() {
        const headers: TableViewProps<Keys>["headers"] = [
            {
                title: <div onClick={() => { this.sortBy("A_ID"); }}>ID</div>,
                contentKey: "A_ID",
                isHeader: true,
            }, {
                title: <div onClick={() => { this.sortBy("C_PROJECT_NAME"); }}>Project Name</div>,
                contentKey: "C_PROJECT_NAME",
            }, {
                title: <div onClick={() => { this.sortBy("totalCount"); }}>Data Count</div>,
                contentKey: "totalCount",
            }, {
                title: <div onClick={() => { this.sortBy("labelCount"); }}>Data Labeled Count</div>,
                contentKey: "labelCount",
            },
        ];
        let contents;
        if (this.props.dObjResult.status === "done") {
            contents = this.props.dObjResult.data.map((entry) => {
                return {
                    A_ID: (<a href={`/app/project/${entry.A_ID}`}>{entry.A_ID}</a>),
                    C_PROJECT_NAME: (<a href={`/app/project/${entry.A_ID}`}>
                        "{entry.C_PROJECT_NAME}"
                    </a>),
                    totalCount: `${entry.totalCount}`,
                    labelCount: `${entry.labelCount} (${entry.labelCount / entry.totalCount * 100}%)`,
                };
            });

        } else {
            contents = [{
                A_ID: "",
                C_PROJECT_NAME: "Loading",
                totalCount: "",
                labelCount: "",
            }];
        }
        return <TableView headers={headers} contents={contents} />;
    }
    private sortBy(columnName: string) {
        if (this.props.dObjResult.status === "done") {
            switch (columnName) {
                case "totalCount":
                case "labelCount":
                    if (this.lastSortedBy === columnName) {
                        this.props.dObjResult.data.sort((a: any, b: any) => a[columnName] - b[columnName]);
                    } else {
                        this.props.dObjResult.data.sort((a: any, b: any) => b[columnName] - a[columnName]);
                    }
                    break;
                default:
                    if (this.lastSortedBy === columnName) {
                        this.props.dObjResult.data.sort((a: any, b: any) => a[columnName] < b[columnName] ? -1 : 1);
                    } else {
                        this.props.dObjResult.data.sort((a: any, b: any) => b[columnName] < a[columnName] ? -1 : 1);
                    }

                    break;
            }
            this.props.updateCallback();
        }
        if (this.lastSortedBy !== columnName) {
            this.lastSortedBy = columnName;
        } else {
            this.lastSortedBy = undefined;
        }

        // sorted
    }
}
