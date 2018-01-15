import * as React from "react";
import { Key } from "react";
import { MatchContent } from "../modules/App";
import { DynamicTableView, DynamicTableViewProps } from "./DynamicTableView";
export type MatchLabelBrowserProps = MatchContent;

export type MatchLabelBrowserStates = {};

type Keys = "name" | "value";

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
        let dataTableContents: DynamicTableViewProps<Keys>["contents"];
        let matchTableContents: DynamicTableViewProps<Keys>["contents"];
        let projectTableContents: DynamicTableViewProps<Keys>["contents"];
        let markedTableContents: DynamicTableViewProps<Keys>["contents"];
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
                                this.props.updateCallback();
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
            const placeholderContentStatus = {
                status: this.props.dObjResult.status,
            };
            dataTableContents = placeholderContentStatus as DynamicTableViewProps<Keys>["contents"];
            matchTableContents = placeholderContentStatus as DynamicTableViewProps<Keys>["contents"];
            projectTableContents = placeholderContentStatus as DynamicTableViewProps<Keys>["contents"];
            markedTableContents = placeholderContentStatus as DynamicTableViewProps<Keys>["contents"];
        }
        return <div className="row">
            <div className="col-md">
                <h2>Data Info</h2>
                <DynamicTableView headers={stdTableHeader} contents={dataTableContents} />
            </div>
            <div className="col-md">
                <h2>Match Info</h2>
                <DynamicTableView headers={stdTableHeader} contents={matchTableContents} />
                <h2>Project Info</h2>
                <DynamicTableView headers={stdTableHeader} contents={projectTableContents} />
                <h2>Mark as</h2>
                <div className="row">
                    <div className="col-md">
                        <div className="btn btn-block btn-success" onClick={async () => {
                            // if (this.props.dObjResult.data.matchData !== undefined) {
                            //     console.log("Valid", this.props.dObjResult.data.matchData.match.matchId);
                            //     const result = await $.post(`/api/mark-match/${this.props.dObjResult.data.matchData.match.matchId}`, { isValid: true });
                            //     console.log("result", result);
                            // }
                        }} >Valid</div>
                    </div>
                    <div className="col-md">
                        <div className="btn btn-block btn-danger" onClick={async () => {
                            // if (this.props.dObjResult.data.matchData !== undefined) {
                            //     console.log("Invalid", this.props.dObjResult.data.matchData.match.matchId);
                            //     const result = await $.post(`/api/mark-match/${this.props.dObjResult.data.matchData.match.matchId}`, { isValid: false });
                            //     console.log("result", result);
                            // }
                        }} >Invalid</div>
                    </div>
                </div>
                <h2>Marked as</h2>
                <DynamicTableView headers={[{
                    title: "User",
                    contentKey: "userId",
                    isHeader: true,
                }, {
                    title: "Value",
                    contentKey: "isValid",
                }]} contents={markedTableContents} />
            </div>
        </div>;
    }
}
