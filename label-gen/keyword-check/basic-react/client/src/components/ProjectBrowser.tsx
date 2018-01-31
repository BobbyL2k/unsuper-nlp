import * as $ from "jquery";
import * as React from "react";
import { Messenger, ProjectKeys, ProjectListContent, SortType } from "../modules/App";
import { dynamicObjResultToContent, TableView, TableViewProps } from "./TableView";
// import { DynamicTableView, DynamicTableViewProps } from "./DynamicTableView";

export interface ProjectBrowserProps extends ProjectListContent {
    messageCallback: Messenger;
}

type Keys = ProjectKeys;

export class ProjectBrowser extends React.Component<ProjectBrowserProps, {}> {
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
                    ID {conditionalChevron(this.props.lastSortedBy === "A_ID", this.props.sortType)}
                </div>,
                contentKey: "A_ID",
                isHeader: true,
            }, {
                title: <div className="clickable" onClick={() => { this.sortBy("C_PROJECT_NAME"); }}>
                    Project Name {conditionalChevron(this.props.lastSortedBy === "C_PROJECT_NAME", this.props.sortType)}
                </div>,
                contentKey: "C_PROJECT_NAME",
            }, {
                title: <div className="clickable" onClick={() => { this.sortBy("totalCount"); }}>
                    Data Count {conditionalChevron(this.props.lastSortedBy === "totalCount", this.props.sortType)}
                </div>,
                contentKey: "totalCount",
            }, {
                title: <div className="clickable" onClick={() => { this.sortBy("labelCount"); }}>
                    Data Labeled Count {conditionalChevron(this.props.lastSortedBy === "labelCount", this.props.sortType)}
                </div>,
                contentKey: "labelCount",
            },
        ];
        const contents = this.props.contents.map((entry) => {
            if (entry.A_ID === undefined) {
                return entry;
            } else {
                return {
                    A_ID: (<a href={`/app/project/${entry.A_ID}`}>{entry.A_ID}</a>),
                    C_PROJECT_NAME: (<a href={`/app/project/${entry.A_ID}`}>
                        "{entry.C_PROJECT_NAME}"
                    </a>),
                    totalCount: `${entry.totalCount}`,
                    labelCount: `${entry.labelCount} (${entry.labelCount / entry.totalCount * 100}%)`,
                };
            }
        });
        return <TableView headers={headers} contents={contents} />;
    }
    private sortBy(columnName: Keys) {
        this.props.messageCallback({ type: "sort", by: columnName });
    }
}
