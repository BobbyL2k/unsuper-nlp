import * as React from "react";
import { Key } from "react";
import { MatchContent, Messenger } from "../modules/App";
import { Result } from "../modules/containers/DynamicObject";
import { dynamicObjResultToContent, TableView, TableViewProps } from "./TableView";
export interface MatchLabelBrowserProps extends MatchContent {
    messageCallback: Messenger;
}

export type MatchLabelBrowserStates = {};

type Keys = "name" | "value";
const matchLabelKeys = ["name", "value"];

export class MatchLabelBrowser extends React.Component<MatchLabelBrowserProps, MatchLabelBrowserStates> {
    constructor(props: MatchLabelBrowserProps) {
        super(props);
    }
    public render() {
        const stdTableHeader = [{
            title: "",
            contentKey: "name",
            isHeader: true,
        }, {
            title: "Value",
            contentKey: "value",
        }];
        function generateTableContent(obj: { [key: string]: any }) {
            const contents = [];
            for (const key of Object.keys(obj)) {
                contents.push({
                    name: key,
                    value: obj[key],
                });
            }
            return contents;
        }
        let dataTableContents: Result<TableViewProps<Keys>["contents"]>;
        let matchTableContents: Result<TableViewProps<Keys>["contents"]>;
        let projectTableContents: Result<TableViewProps<Keys>["contents"]>;
        let markedTableContents: Result<TableViewProps<Keys>["contents"]>;
        if (this.props.dObjResult.status === "done") {
            console.log(this.props.dObjResult);
            dataTableContents = {
                status: "done",
                data: generateTableContent(this.props.dObjResult.data.matchData.data),
            };

            for (const entry of dataTableContents.data) {
                if (entry.name === "content") {
                    const range = 200;
                    const lowerbound = this.props.dObjResult.data.showAllContent ?
                        0 :
                        Math.max(
                            0,
                            this.props.dObjResult.data.matchData.match.start - range);
                    const upperbound = this.props.dObjResult.data.showAllContent ?
                        this.props.dObjResult.data.matchData.data.content.length :
                        Math.min(
                            this.props.dObjResult.data.matchData.data.content.length,
                            this.props.dObjResult.data.matchData.match.start + range);

                    const beforeMatchStr = this.props.dObjResult.data.matchData.data.content.slice(lowerbound, this.props.dObjResult.data.matchData.match.start);
                    const matchStr = this.props.dObjResult.data.matchData.data.content.slice(this.props.dObjResult.data.matchData.match.start, this.props.dObjResult.data.matchData.match.end);
                    const afterMatchStr = this.props.dObjResult.data.matchData.data.content.slice(this.props.dObjResult.data.matchData.match.end, upperbound);

                    entry.name = <span>
                        content
                        <div className="badge btn-success" onClick={() => {
                            if (this.props.dObjResult.status === "done") {
                                this.props.dObjResult.data.showAllContent = !this.props.dObjResult.data.showAllContent;
                                this.props.messageCallback();
                            }
                        }} style={{ cursor: "pointer" }}>{this.props.dObjResult.data.showAllContent ? "hide" : "show all"}</div>
                    </span>;
                    entry.value = <span>
                        {this.props.dObjResult.data.showAllContent ? "" : "..."}
                        {beforeMatchStr}
                        <span className="badge badge-primary">{matchStr}</span>
                        {afterMatchStr}
                        {this.props.dObjResult.data.showAllContent ? "" : "..."}
                    </span>;
                }
            }
            matchTableContents = {
                status: "done",
                data: generateTableContent(this.props.dObjResult.data.matchData.match),
            };
            projectTableContents = {
                status: "done",
                data: generateTableContent(this.props.dObjResult.data.matchData.project),
            };
            markedTableContents = {
                status: "done",
                data: this.props.dObjResult.data.matchData.validation.map((entry) => {
                    return {
                        userId: entry.userId,
                        isValid: entry.isValid ? "Valid" : "Not Valid",
                    };
                }),
            };

        } else {
            const placeholderContentStatus: Result<TableViewProps<Keys>["contents"]> = {
                status: this.props.dObjResult.status,
            } as Result<any>;
            dataTableContents = placeholderContentStatus;
            matchTableContents = placeholderContentStatus;
            projectTableContents = placeholderContentStatus;
            markedTableContents = placeholderContentStatus;
        }
        return <div className="container">
            <div className="row">
                <div className="col-md">
                    <h2>Data Info</h2>
                    <TableView headers={stdTableHeader} contents={dynamicObjResultToContent(dataTableContents, matchLabelKeys)} />
                </div>
                <div className="col-md">
                    <h2>Match Info</h2>
                    <TableView headers={stdTableHeader} contents={dynamicObjResultToContent(matchTableContents, matchLabelKeys)} />
                    <h2>Project Info</h2>
                    <TableView headers={stdTableHeader} contents={dynamicObjResultToContent(projectTableContents, matchLabelKeys)} />
                    <h2>Mark as</h2>
                    <div className="row">
                        <div className="col-md">
                            <div className="btn btn-block btn-success" onClick={() => {
                                this.props.messageCallback({
                                    type: "mark-match",
                                    valid: true,
                                });
                            }} >Valid</div>
                        </div>
                        <div className="col-md">
                            <div className="btn btn-block btn-danger" onClick={() => {
                                this.props.messageCallback({
                                    type: "mark-match",
                                    valid: false,
                                });
                            }} >Invalid</div>
                        </div>
                    </div>
                    <h2>Marked as</h2>
                    <TableView headers={[{
                        title: "User",
                        contentKey: "userId",
                        isHeader: true,
                    }, {
                        title: "Value",
                        contentKey: "isValid",
                    }]} contents={dynamicObjResultToContent(markedTableContents, matchLabelKeys)} />
                </div>
            </div>
        </div>;
    }
}
