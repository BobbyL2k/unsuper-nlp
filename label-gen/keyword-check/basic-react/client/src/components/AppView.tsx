import * as React from "react";
import { AppViewProps } from "../modules/App";
import { MatchLabelBrowser } from "./MatchLabelBrowser";
import { Navigation, NavigationProps } from "./Navigation";
import { PostBrowser } from "./PostBrowser";
import { ProjectBrowser } from "./ProjectBrowser";

export class AppView extends React.Component<AppViewProps, {}> {
    constructor(props: AppViewProps) {
        super(props);
    }
    public render() {
        let body = null;
        let bottomBar = null;
        switch (this.props.content.mode) {
            case "projectList":
                body = <ProjectBrowser {...this.props.content} messageCallback={this.props.messageCallback} />;
                break;
            case "postList":
                body = <PostBrowser {...this.props.content} />;
                break;
            case "matchEntry":
                body = <MatchLabelBrowser {...this.props.content} messageCallback={this.props.messageCallback} />;
                break;
            default:
                break;
        }
        if (this.props.pageReference.slicer !== undefined) {
            const indexStart = this.props.pageReference.slicer.start + 1;
            const indexEnd = this.props.pageReference.slicer.start + this.props.pageReference.slicer.size;
            const canClickPrev = this.props.pageReference.slicer.start - this.props.pageReference.slicer.size >= 0;
            const canClickNext = this.props.pageReference.slicer.start + this.props.pageReference.slicer.size < this.props.pageReference.totalElement;
            bottomBar = <div className="fixed-bottom-bar table-page-select-bottom-bar">
                <div className="btn-group page-select-bar">
                    <button type="button" className={`btn btn-primary ${canClickPrev ? "" : "disabled"}`} onClick={() => {
                        if (this.props.pageReference.slicer !== undefined && canClickPrev) {
                            this.props.pageReference.slicer.start =
                                this.props.pageReference.slicer.start - this.props.pageReference.slicer.size;
                            console.log(this.props.pageReference.slicer.start, "click");
                            this.props.messageCallback();
                        }
                    }} >&laquo;</button>
                    <div className="btn btn-light disabled">
                        Displaying {indexStart} - {Math.min(indexEnd, this.props.pageReference.totalElement)} of {this.props.pageReference.totalElement}
                    </div>
                    <button type="button" className={`btn btn-primary ${canClickNext ? "" : "disabled"}`} onClick={() => {
                        if (this.props.pageReference.slicer !== undefined && canClickNext) {
                            this.props.pageReference.slicer.start =
                                this.props.pageReference.slicer.start + this.props.pageReference.slicer.size;
                            console.log(this.props.pageReference.slicer.start, "click");
                            this.props.messageCallback();
                        }
                    }}>&raquo;</button>
                </div>
            </div>;
        }
        return <div>
            <Navigation {...this.props.nav} />
            {body}
            {bottomBar}
        </div >;
    }
}
