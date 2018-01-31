import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppView } from "../components/AppView";
import { NavigationProps } from "../components/Navigation";
import { dynamicObjResultToContent } from "../components/TableView";
import { DynamicObject, Result } from "../modules/containers/DynamicObject";
import { Slicer } from "../modules/Slicer";

export type SortType = "ascending" | "descending";

export type ProjectKeys = "A_ID" | "C_PROJECT_NAME" | "totalCount" | "labelCount";
const projectKeys: ProjectKeys[] = ["A_ID", "C_PROJECT_NAME", "totalCount", "labelCount"];

export type Messenger = (message?: MessageType) => void;

export interface ProjectListContent {
    mode: "projectList";
    contents: Array<{
        A_ID: string,
        C_PROJECT_NAME: string,
        totalCount: number,
        labelCount: number,
    }>;
    lastSortedBy?: ProjectKeys;
    sortType?: SortType;
}

export type PostKeys = "matchId" | "title" | "source" | "labeled";
const postKeys: PostKeys[] = ["matchId", "title", "source", "labeled"];

export type ProjectPostListContent = {
    mode: "postList",
    projectId: string,
    contents: Array<{
        matchId: string,
        title: string,
        source: string,
        labeled: boolean,
    }>,
    lastSortedBy?: ProjectKeys;
    sortType?: SortType;
};

export type MatchContent = {
    mode: "matchEntry",
    matchId: string,
    dObjResult: Result<{
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
        },
        showAllContent: boolean;
    }>,
};

type MessageType =
    {
        type: "sort",
        by: ProjectKeys,
    } | {
        type: "mark-match",
        valid: boolean,
    };

export type AppViewProps = {
    nav: NavigationProps,
    content: {
        mode: null,
    } | ProjectListContent | ProjectPostListContent | MatchContent,
    pageReference: {
        slicer?: Slicer,
        totalElement: number,
    },
    messageCallback: Messenger,
};

export class App {
    private appViewProps: AppViewProps = {
        nav: {
            path: [],
            currentPathIndex: 0,
        },
        content: {
            mode: null,
        },
        pageReference: {
            slicer: undefined,
            totalElement: 0,
        },
        messageCallback: this.onMessage.bind(this),
    };
    private dObj: DynamicObject<any> | null = null;
    private storage:
        {
            projectBrowser: {
                dObjResult: Result<ProjectListContent["contents"]>,
                slicer: Slicer,
                dObj?: DynamicObject<ProjectListContent["contents"]>;
                lastSortedBy?: ProjectKeys;
                sortType?: SortType;
            },
            postBrowser: {
                projectId?: string,
                dObjResult: Result<ProjectPostListContent["contents"]>,
                slicer: Slicer,
                dObj?: DynamicObject<ProjectPostListContent["contents"]>;
                lastSortedBy?: PostKeys;
                sortType?: SortType;
            },
            matchBrowser: {
                dObj?: DynamicObject<ProjectPostListContent["contents"]>;
                matchIndex: number,
            },
            nav: {
                rawPath: AppViewProps["nav"]["path"],
            }
        } = {
            projectBrowser: {
                dObjResult: { status: "loading" },
                slicer: new Slicer(0, 12),
            },
            postBrowser: {
                dObjResult: { status: "loading" },
                slicer: new Slicer(0, 12),
            },
            matchBrowser: {
                matchIndex: 0,
            },
            nav: {
                rawPath: [],
            }
        };
    constructor(path: string, private targetElement: HTMLElement) {
        this.onNewPath(path);
    }
    public onNewPath(path: string) {
        history.pushState(null, "", path);
        try {
            this.storage.nav.rawPath = this.parsePath(path);
        } catch (error) {
            document.location.href = path;
        }

        this.setMode(this.storage.nav.rawPath);
        this.appViewProps.nav.path = this.calculatePath(this.storage.nav.rawPath, this.appViewProps.content.mode);
        this.appViewProps.nav.currentPathIndex = this.appViewProps.nav.path.length - 1;

        if (this.appViewProps.content.mode === "projectList" && this.storage.projectBrowser.dObj === undefined) {

            this.storage.projectBrowser.dObj = new DynamicObject<any[]>("/api/project-index");
            this.storage.projectBrowser.dObj.onUpdate((dObjResult) => {
                this.storage.projectBrowser.dObjResult = dObjResult;
                this.renderPage();
            });

        } else if (this.appViewProps.content.mode === "postList") {

            this.storage.postBrowser.projectId = this.appViewProps.content.projectId;
            if (this.storage.postBrowser.dObj === undefined) {
                console.log("new dObject");
                this.storage.postBrowser.dObj = new DynamicObject<any[]>(`/api/project/${this.appViewProps.content.projectId}`);
                this.storage.postBrowser.dObj.onUpdate((dObjecResult) => {
                    this.storage.postBrowser.dObjResult = dObjecResult;
                    console.log("call2");
                    this.renderPage();
                });
            } else if (this.storage.postBrowser.dObj.url !== `/api/project/${this.appViewProps.content.projectId}`) {
                console.log("call1");
                this.storage.postBrowser.dObj.rebindData(`/api/project/${this.appViewProps.content.projectId}`);
                console.log("call3");
                this.renderPage();
            }

        } else if (this.appViewProps.content.mode === "matchEntry") {

            if (this.storage.postBrowser.dObjResult.status === "done") {
                for (let index = 0; index < this.storage.postBrowser.dObjResult.data.length; index++) {
                    if (this.storage.postBrowser.dObjResult.data[index].matchId === this.appViewProps.content.matchId) {
                        this.storage.matchBrowser.matchIndex = index;
                        break;
                    }
                }
            }

            this.dObj = new DynamicObject<any>(`/api/data/match/${this.appViewProps.content.matchId}`);
            this.dObj.onUpdate((storage) => {
                if (this.appViewProps.content.mode === "matchEntry") {
                    if (storage.status === "done") {
                        this.appViewProps.content.dObjResult = {
                            status: "done",
                            data: {
                                matchData: storage.data,
                                showAllContents: false,
                            },
                        } as any;
                    } else {
                        this.appViewProps.content.dObjResult = storage;
                    }
                    this.renderPage();
                }
            });

        }

        this.renderPage();
    }
    public onMessage(message?: MessageType) {
        if (message !== undefined) {
            if (message.type === "sort") {
                if (this.storage.projectBrowser.dObjResult.status === "done" && this.appViewProps.content.mode === "projectList") {
                    if (this.storage.projectBrowser.lastSortedBy === message.by && this.storage.projectBrowser.sortType === "ascending") {
                        this.storage.projectBrowser.sortType = "descending";
                        switch (message.by) {
                            case "totalCount":
                            case "labelCount":
                                this.storage.projectBrowser.dObjResult.data.sort((a: any, b: any) => b[message.by] - a[message.by]);
                                break;
                            default:
                                this.storage.projectBrowser.dObjResult.data.sort((a: any, b: any) => b[message.by] < a[message.by] ? -1 : 1);
                                break;
                        }
                    } else {
                        this.storage.projectBrowser.sortType = "ascending";
                        switch (message.by) {
                            case "totalCount":
                            case "labelCount":
                                this.storage.projectBrowser.dObjResult.data.sort((a: any, b: any) => a[message.by] - b[message.by]);
                                break;
                            default:
                                this.storage.projectBrowser.dObjResult.data.sort((a: any, b: any) => a[message.by] < b[message.by] ? -1 : 1);
                                break;
                        }
                    }
                    this.storage.projectBrowser.lastSortedBy = message.by;
                    console.log("sorting", message.by, this.storage.projectBrowser.sortType);
                }
            } else if (message.type === "mark-match" && this.appViewProps.content.mode === "matchEntry") {
                if (this.appViewProps.content.dObjResult.status === "done" && this.appViewProps.content.dObjResult.data.matchData !== undefined) {
                    console.log("Valid", this.appViewProps.content.dObjResult.data.matchData.match.matchId);
                    $.post(`/api/mark-match/${this.appViewProps.content.dObjResult.data.matchData.match.matchId}`, { isValid: message.valid })
                        .then((result) => {
                            if (this.storage.postBrowser.dObjResult.status === "done") {
                                const nextMatch = this.storage.postBrowser.dObjResult.data[this.storage.matchBrowser.matchIndex + 1];
                                if (nextMatch !== undefined) {
                                    this.onNewPath(`/app/project/${this.storage.postBrowser.projectId}/match/${nextMatch.matchId}`);
                                } else {
                                    this.onNewPath(`/app/project/${this.storage.postBrowser.projectId}`);
                                }
                            } else {
                                this.onNewPath('/app/' + this.appViewProps.nav.path[1].href);
                            }
                        })
                        .catch((err) => {
                            console.log("err", err);
                        });
                }
            }
        }
        this.renderPage();
    }
    public renderPage() {
        if (this.appViewProps.content.mode === "projectList") {
            this.appViewProps.content.sortType = this.storage.projectBrowser.sortType;
            this.appViewProps.content.lastSortedBy = this.storage.projectBrowser.lastSortedBy;
            if (this.storage.projectBrowser.dObjResult.status === "done") {
                this.appViewProps.pageReference.slicer = this.storage.projectBrowser.slicer;
                this.appViewProps.pageReference.totalElement = this.storage.projectBrowser.dObjResult.data.length;
                this.appViewProps.content.contents =
                    this.storage.projectBrowser.slicer.slice(this.storage.projectBrowser.dObjResult.data);
            } else {
                this.appViewProps.pageReference.slicer = undefined;
                this.appViewProps.pageReference.totalElement = 0;
                this.appViewProps.content.contents =
                    dynamicObjResultToContent(this.storage.projectBrowser.dObjResult, projectKeys) as ProjectListContent["contents"];
            }
        } else if (this.appViewProps.content.mode === "postList") {
            // this.appViewProps.content.sortType = this.storage.postBrowser.sortType;
            // this.appViewProps.content.lastSortedBy = this.storage.postBrowser.lastSortedBy;
            if (this.storage.postBrowser.dObjResult.status === "done") {
                this.appViewProps.pageReference.slicer = this.storage.postBrowser.slicer;
                this.appViewProps.pageReference.totalElement = this.storage.postBrowser.dObjResult.data.length;
                this.appViewProps.content.contents =
                    this.storage.postBrowser.slicer.slice(this.storage.postBrowser.dObjResult.data);
            } else {
                this.appViewProps.pageReference.slicer = undefined;
                this.appViewProps.pageReference.totalElement = 0;
                this.appViewProps.content.contents =
                    dynamicObjResultToContent(this.storage.postBrowser.dObjResult, postKeys) as ProjectPostListContent["contents"];
            }
        } else {
            this.appViewProps.pageReference.slicer = undefined;
            this.appViewProps.pageReference.totalElement = 0;
        }
        console.log("rendering");
        ReactDOM.render(
            <AppView {...this.appViewProps} />,
            this.targetElement,
        );
    }
    private parsePath(pathString: string) {
        const path: AppViewProps["nav"]["path"] = [];
        const [appUrl, ...parts] = pathString.split("/").slice(1);
        if (appUrl !== "app") {
            throw new Error("Error non-app url");
        }
        for (const [index, part] of parts.entries()) {
            if (part.length !== 0) {
                path.push({
                    label: part,
                    href: parts.slice(0, index + 1).join("/"),
                });
            }
        }
        return path;
    }
    private calculatePath(rawPath: AppViewProps["nav"]["path"], mode: AppViewProps["content"]["mode"]) {
        const path: AppViewProps["nav"]["path"] = [];
        switch (mode) {
            case "projectList":
                path.push(rawPath[0]);
                break;
            case "postList":
                path.push(rawPath[0]);
                path.push(rawPath[1]);

                break;
            case "matchEntry":
                path.push(rawPath[0]);
                path.push(rawPath[1]);
                path.push({
                    label: rawPath[2].label + rawPath[3].label,
                    href: rawPath[3].href,
                });
                break;
            default:
                break;
        }
        return path;
    }
    private setMode(path: AppViewProps["nav"]["path"]) {
        let mode: AppViewProps["content"]["mode"] = null;

        function unknownPathRoutine() {
            console.log("Unknown path", path, "Redirecting to \"/app/project\"");
            document.location.href = document.location.origin + "/app/project";
        }

        if (path.length === 0) {
            console.log("Empty path detected, redirecting to \"/app/project\"");
            document.location.href = document.location.origin + "/app/project";
            mode = null;
        } else if (path[0].label === "project") {
            if (path.length === 1) {
                mode = "projectList";
            } else if (path.length === 2) {
                mode = "postList";
            } else if (path.length > 3 && path[2].label === "match") {
                mode = "matchEntry";
            } else {
                unknownPathRoutine();
            }
        } else if (path[0].label === "post") {
            console.log("to implement post");
        } else {
            unknownPathRoutine();
        }

        switch (mode) {
            case "projectList":
                this.appViewProps.content = {
                    mode: "projectList",
                    contents: dynamicObjResultToContent({ status: "loading" }, projectKeys) as ProjectListContent["contents"],
                };
                break;
            case "postList":
                this.appViewProps.content = {
                    mode: "postList",
                    projectId: path[1].label,
                    contents: dynamicObjResultToContent({ status: "loading" }, postKeys) as ProjectPostListContent["contents"],
                };
                break;
            case "matchEntry":
                this.appViewProps.content = {
                    mode: "matchEntry",
                    matchId: path.slice(3).map(elem => elem.label).join('/'),
                    dObjResult: { status: "loading" },
                };
                break;
            default:
                console.log("Unknown App Mode");
                this.appViewProps.content = {
                    mode: null,
                };
                break;
        }
    }
}
