import * as $ from "jquery";
import * as React from "react";
import { ProjectListContent } from "../modules/App";
import { TableView, TableViewProps } from "./TableView";

export type ProjectBrowserProps = ProjectListContent;

type Keys = "A_ID" | "C_PROJECT_NAME" | "totalCount" | "labelCount";

type SortType = "ascending" | "descending";

export class ProjectBrowser extends React.Component<ProjectBrowserProps, {}> {
    private lastSortedBy?: Keys;
    private sortType?: SortType;
    constructor(props: ProjectBrowserProps) {
        super(props);
    }
    public render() {
        function conditionalChevron(shouldAdd: boolean, type: SortType | undefined) {
            if (shouldAdd && type !== undefined) {
                if (type === "ascending") {
                    return <i className="fa fa-chevron-up" aria-hidden="true"></i>;
                } else if (type === "descending") {
                    return <i className="fa fa-chevron-down" aria-hidden="true"></i>;
                }
            } else {
                return null;
            }
        }
        const headers: TableViewProps<Keys>["headers"] = [
            {
                title: <div className="clickable" onClick={() => { this.sortBy("A_ID"); }}>
                    ID {conditionalChevron(this.lastSortedBy === "A_ID", this.sortType)}
                </div>,
                contentKey: "A_ID",
                isHeader: true,
            }, {
                title: <div className="clickable" onClick={() => { this.sortBy("C_PROJECT_NAME"); }}>
                    Project Name {conditionalChevron(this.lastSortedBy === "C_PROJECT_NAME", this.sortType)}
                </div>,
                contentKey: "C_PROJECT_NAME",
            }, {
                title: <div className="clickable" onClick={() => { this.sortBy("totalCount"); }}>
                    Data Count {conditionalChevron(this.lastSortedBy === "totalCount", this.sortType)}
                </div>,
                contentKey: "totalCount",
            }, {
                title: <div className="clickable" onClick={() => { this.sortBy("labelCount"); }}>
                    Data Labeled Count {conditionalChevron(this.lastSortedBy === "labelCount", this.sortType)}
                </div>,
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
    private sortBy(columnName: Keys) {
        if (this.props.dObjResult.status === "done") {
            if (this.lastSortedBy === columnName && this.sortType === "ascending") {
                this.sortType = "descending";
                switch (columnName) {
                    case "totalCount":
                    case "labelCount":
                        this.props.dObjResult.data.sort((a: any, b: any) => b[columnName] - a[columnName]);
                        break;
                    default:
                        this.props.dObjResult.data.sort((a: any, b: any) => b[columnName] < a[columnName] ? -1 : 1);
                        break;
                }
            } else {
                this.sortType = "ascending";
                switch (columnName) {
                    case "totalCount":
                    case "labelCount":
                        this.props.dObjResult.data.sort((a: any, b: any) => a[columnName] - b[columnName]);
                        break;
                    default:
                        this.props.dObjResult.data.sort((a: any, b: any) => a[columnName] < b[columnName] ? -1 : 1);
                        break;
                }
            }
            this.lastSortedBy = columnName;
            console.log("sorting", this.sortType, columnName);
            this.props.updateCallback();
        }
        // sorted
    }
}
