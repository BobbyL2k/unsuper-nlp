import * as React from "react";

export type TableViewProps<Keys extends string> = {
    headers: Array<{
        title: string | JSX.Element,
        contentKey: Keys,
        isHeader?: boolean,
    }>,
    contents: Array<{
        [key: string]: string | JSX.Element,
    }>,
};

export type TableViewStates = {
};

export class TableView<Keys extends string> extends React.Component<TableViewProps<Keys>, TableViewStates> {
    constructor(props: TableViewProps<Keys>) {
        super(props);
    }
    public render() {
        const headersComponent: JSX.Element[] = [];
        for (let c = 0; c < this.props.headers.length; c++) {
            headersComponent.push(
                <th key={c} scope="col">{this.props.headers[c].title}</th>,
            );
        }

        const rows: JSX.Element[] = [];
        for (const content of this.props.contents) {
            const rowContent: JSX.Element[] = [];
            for (const header of this.props.headers) {
                rowContent.push(<td key={rowContent.length}>
                    {content[header.contentKey]}
                </td>);
            }
            // console.log(rows.length, rows);
            rows.push(<tr key={rows.length}>{rowContent}</ tr>);
            // debugger;
        }
        if (this.props.contents.length === 0) {
            const rowContent: JSX.Element[] = [];
            for (let c = 0; c < this.props.headers.length; c++) {
                if (c === 1) {
                    rowContent.push(<td key={c}>No data to display</td>);
                } else {
                    rowContent.push(<td key={c}></td>);
                }
            }
            rows.push(<tr key={-1}>{rowContent}</ tr>);
        }

        return <table className="table">
            <thead>
                <tr>
                    {headersComponent}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>;
    }
}
