import * as React from "react";
import { PostListContent } from "../modules/App";
import { TableView, TableViewProps } from "./TableView";

export type PostBrowserProps = PostListContent;

export type PostBrowserStates = {
};

type Keys = "matchId" | "title" | "source" | "labeled";
interface PostTableViewType { new(): TableView<Keys>; }
const PostTableView = TableView as PostTableViewType;

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
        let contents;
        if (this.props.dObjResult.status === "done") {
            contents = this.props.dObjResult.data.map((entry) => {
                const linkToMatchData = `/app/project/${this.props.projectId}/${entry.matchId}`;
                return {
                    matchId: (<a href={linkToMatchData}>{entry.matchId}</a>),
                    title: (<a href={linkToMatchData}>
                        "{entry.title}"
                    </a>),
                    source: `${entry.source}`,
                    labeled: `${entry.labeled ? "Yes" : "No"}`,
                };
            });

        } else {
            contents = [{
                matchId: "",
                title: "Loading",
                source: "",
                labeled: "",
            }];
        }
        return <PostTableView headers={headers} contents={contents} />;
    }
}
