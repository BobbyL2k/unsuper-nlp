import * as React from "react";
import { Result } from "../modules/Containers";
import { TableView } from "./TableView";

export type DynamicTableViewProps<Keys extends string> = {
    headers: Array<{
        title: string,
        contentKey: Keys,
        isHeader?: boolean,
    }>,
    contents: Result<Array<{
        [key: string]: string | JSX.Element,
    }>>,
};

export type DynamicTableViewStates = {
};
export class DynamicTableView<Keys extends string> extends React.Component<DynamicTableViewProps<Keys>, DynamicTableViewStates> {
    constructor(props: DynamicTableViewProps<Keys>) {
        super(props);
    }
    public render() {
        let contents;
        switch (this.props.contents.status) {
            case "done":
                contents = this.props.contents.data;
                break;
            case "loading":
                contents = [{
                    name: "",
                    value: "Loading",
                }];
                break;
            case "failed":
                contents = [{
                    name: "",
                    value: "Failed to load data",
                }];
                break;
            default:
                console.log("Unknown dynamic object status", this.props.contents);
                return <div>"Unknown dynamic object status"</div>;
        }
        return <TableView headers={this.props.headers} contents={contents} />;
    }
}
