import * as React from "react";
import { PostKeys, ProjectPostListContent } from "../modules/App";
import { TableView, TableViewProps } from "./TableView";

export type PostBrowserProps = ProjectPostListContent;

export type PostBrowserStates = {
};

type Keys = PostKeys;

export class PostBrowser extends React.Component<PostBrowserProps, PostBrowserStates> {
    constructor(props: PostBrowserProps) {
        super(props);
    }
    public render() {
        const headers: TableViewProps<Keys>["headers"] = [
            {
                title: "Match ID",
                contentKey: "matchId",
                isHeader: true,
            }, {
                title: "Title",
                contentKey: "title",
            }, {
                title: "Source",
                contentKey: "source",
            }, {
                title: "Labeled",
                contentKey: "labeled",
            },
        ];
        const contents = this.props.contents.map((entry) => {
            if (entry.matchId === undefined) {
                return entry;
            } else {
                const linkToMatchData = `/app/project/${this.props.projectId}/match/${entry.matchId}`;
                return {
                    matchId: (<a href={linkToMatchData}>{entry.matchId}</a>),
                    title: (<a href={linkToMatchData}>
                        "{entry.title}"
                        </a>),
                    source: `${entry.source}`,
                    labeled: `${entry.labeled ? "Yes" : "No"}`,
                };
            }
        });
        return <TableView headers={headers} contents={contents} />;
    }
}
