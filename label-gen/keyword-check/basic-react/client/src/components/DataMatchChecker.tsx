import * as $ from "jquery";
import * as React from "react";
import { global } from "../index";

export type DataMatchCheckerProps = {
    matchId: string,
};

export type DataMatchCheckerStates = {
    matchData: {
        data: {
            dataId: string,
            title: string,
            content: string,
            source: string,
            [key: string]: string,
        },
        project: {
            [key: string]: string,
        },
        match: {
            matchId: string,
            start: number,
            end: number,
            [key: string]: string | number,
        },
        validation: [{ userId: string, isValid: boolean }],
    } | undefined,
    showAllContent: boolean;
};

export class DataMatchChecker extends React.Component<DataMatchCheckerProps, DataMatchCheckerStates> {
    constructor(props: DataMatchCheckerProps) {
        super(props);
        this.state = {
            matchData: undefined,
            showAllContent: false,
        } as Readonly<DataMatchCheckerStates>;
    }
    public async componentWillMount() {
        console.log("loading matchData for", this.props.matchId);
        const matchData = await $.getJSON(`/api/data/match/${this.props.matchId}`);
        console.log("loaded matchData for", this.props.matchId, matchData);
        this.setState({ matchData });
    }
    public render() {
        const projectDataRows = [];
        const validationDataRows = [];
        const matchDataRows = [];
        const dataRows = [];
        if (this.state.matchData !== undefined) {
            for (const key in this.state.matchData.match) {
                if (this.state.matchData.match.hasOwnProperty(key)) {
                    matchDataRows.push(
                        <tr key={key}>
                            <th scope="row">
                                {key}
                            </th>
                            <td>
                                "{this.state.matchData.match[key]}"
                            </td>
                        </tr>,
                    );
                }
            }
            for (const key in this.state.matchData.project) {
                if (this.state.matchData.project.hasOwnProperty(key)) {
                    projectDataRows.push(
                        <tr key={key}>
                            <th scope="row">
                                {key}
                            </th>
                            <td>
                                "{this.state.matchData.project[key]}"
                            </td>
                        </tr>,
                    );
                }
            }
            for (const validationData of this.state.matchData.validation) {
                validationDataRows.push(
                    <tr key={validationData.userId}>
                        <th scope="row">
                            {validationData.userId}{validationData.userId === global.userId ? "(You)" : ""}
                        </th>
                        <td className={validationData.isValid ? "text-success" : "text-danger"}>
                            {validationData.isValid ? "Valid" : "Invalid"}
                        </td>
                    </tr>,
                );
            }
            for (const key in this.state.matchData.data) {
                if (this.state.matchData.data.hasOwnProperty(key)) {
                    if (key === "content") {

                        const range = 200;
                        const lowerbound = this.state.showAllContent ?
                            0 :
                            Math.max(
                                0,
                                this.state.matchData.match.start - range);
                        const upperbound = this.state.showAllContent ?
                            this.state.matchData.data[key].length :
                            Math.min(
                                this.state.matchData.data[key].length,
                                this.state.matchData.match.start + range);

                        const beforeMatchStr = this.state.matchData.data[key].slice(lowerbound, this.state.matchData.match.start);
                        const matchStr = this.state.matchData.data[key].slice(this.state.matchData.match.start, this.state.matchData.match.end);
                        const afterMatchStr = this.state.matchData.data[key].slice(this.state.matchData.match.end, upperbound);

                        dataRows.push(
                            <tr key={key}>
                                <th scope="row">
                                    {key}
                                    <div className="badge btn-success" onClick={() => {
                                        this.setState({ showAllContent: !this.state.showAllContent });
                                    }} style={{ cursor: "pointer" }}>{this.state.showAllContent ? "hide" : "show all"}</div>
                                </th>
                                <td>
                                    {this.state.showAllContent ? "" : "..."}
                                    {beforeMatchStr}
                                    <span className="badge badge-primary">{matchStr}</span>
                                    {afterMatchStr}
                                    {this.state.showAllContent ? "" : "..."}
                                </td>
                            </tr >,
                        );
                    } else {
                        dataRows.push(
                            <tr key={key}>
                                <th scope="row">
                                    {key}
                                </th>
                                <td>
                                    "{this.state.matchData.data[key]}"
                                </td>
                            </tr>,
                        );
                    }
                }
            }
        } else {
            projectDataRows.push(<tr key={0}>
                <th scope="row"></th>
                <td>Loading</td>
            </tr>);
            validationDataRows.push(<tr key={1}>
                <th scope="row"></th>
                <td>Loading</td>
            </tr>);
            dataRows.push(<tr key={1}>
                <th scope="row"></th>
                <td>Loading</td>
            </tr>);
        }

        return <div className="row">
            <div className="col-md">
                <h2>Data Info</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Value</th>
                        </tr>
                    </thead>
                    <tbody>{dataRows}</tbody>
                </table>
            </div>
            <div className="col-md">
                <h2>Match Info</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Value</th>
                        </tr>
                    </thead>
                    <tbody>{matchDataRows}</tbody>
                </table>
                <h2>Project Info</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Value</th>
                        </tr>
                    </thead>
                    <tbody>{projectDataRows}</tbody>
                </table>
                <h2>Mark as</h2>
                <div className="row">
                    <div className="col-md">
                        <div className="btn btn-block btn-success" onClick={() => {
                            if (this.state.matchData !== undefined) {
                                console.log("Valid", this.state.matchData.match.matchId);
                            }
                        }} >Valid</div>
                    </div>
                    <div className="col-md">
                        <div className="btn btn-block btn-danger" onClick={() => {
                            if (this.state.matchData !== undefined) {
                                console.log("Invalid", this.state.matchData.match.matchId);
                            }
                        }} >Invalid</div>
                    </div>
                </div>
                <h2>Marked as</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">User</th>
                            <th scope="col">Value</th>
                        </tr>
                    </thead>
                    <tbody>{validationDataRows}</tbody>
                </table>
            </div>
        </div>;
    }
}
