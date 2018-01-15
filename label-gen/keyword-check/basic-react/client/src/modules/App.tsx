import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppView } from "../components/AppView";
import { NavigationProps } from "../components/Navigation";
import { DynamicObject, Result } from "../modules/Containers";

export type ProjectListContent = {
    mode: "projectList",
    dObjResult: Result<Array<{
        A_ID: string,
        C_PROJECT_NAME: string,
        totalCount: number,
        labelCount: number,
    }>>,
    updateCallback: () => void,
};

export type PostListContent = {
    mode: "postList",
    projectId: string,
    dObjResult: Result<Array<{
        matchId: string,
        title: string,
        source: string,
        labeled: boolean,
    }>>,
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
    updateCallback: () => void,
};

export type AppViewProps = {
    nav: NavigationProps;
    content: {
        mode: null,
    } | ProjectListContent | PostListContent | MatchContent,
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
    };
    private dObj: DynamicObject<any> | null = null;
    constructor(path: string, private targetElement: HTMLElement) {
        this.onNewPath(path);
    }
    public onNewPath(path: string) {
        try {
            this.appViewProps.nav.path = this.calculatePath(path);
            this.appViewProps.nav.currentPathIndex = this.appViewProps.nav.path.length - 1;
        } catch (error) {
            document.location.href = path;
        }

        this.setMode(this.appViewProps.nav.path);

        if (this.appViewProps.content.mode === "projectList") {
            this.dObj = new DynamicObject<any[]>("/api/project-index");
            this.dObj.onUpdate((storage) => {
                if (this.appViewProps.content.mode === "projectList") {
                    this.appViewProps.content.dObjResult = storage;
                    this.renderPage();
                }
            });
        } else if (this.appViewProps.content.mode === "postList") {
            this.dObj = new DynamicObject<any[]>(`/api/project/${this.appViewProps.content.projectId}`);
            this.dObj.onUpdate((storage) => {
                if (this.appViewProps.content.mode === "postList") {
                    this.appViewProps.content.dObjResult = storage;
                    this.renderPage();
                }
            });
        } else if (this.appViewProps.content.mode === "matchEntry") {
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
                        } as MatchContent["dObjResult"];
                    } else {
                        this.appViewProps.content.dObjResult = storage;
                    }
                    this.renderPage();
                }
            });
        }

        this.renderPage();
    }
    public renderPage() {
        ReactDOM.render(
            <AppView {...this.appViewProps} />,
            this.targetElement,
        );
    }
    private calculatePath(rawPath: string) {
        const path: AppViewProps["nav"]["path"] = [];
        const [appUrl, ...parts] = rawPath.split("/").slice(1);
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
        console.log("path", path);
        return path;
    }
    private setMode(path: AppViewProps["nav"]["path"]) {
        let mode: AppViewProps["content"]["mode"];
        if (path.length === 0) {
            console.log("Empty path detected, redirecting to \"/app/project\"");
            document.location.href = document.location.origin + "/app/project";
            mode = null;
        } else if (path.length === 1 && path[0].label === "project") {
            mode = "projectList";
        } else if (path.length === 2 && path[0].label === "project") {
            mode = "postList";
        } else if (path.length === 3 && path[0].label === "project") {
            mode = "matchEntry";
        } else {
            console.log("Unknown path", path, "Redirecting to \"/app/project\"");
            document.location.href = document.location.origin + "/app/project";
            mode = null;
        }

        switch (mode) {
            case "projectList":
                this.appViewProps.content = {
                    mode: "projectList",
                    dObjResult: { status: "loading" },
                    updateCallback: this.renderPage.bind(this),
                };
                break;
            case "postList":
                this.appViewProps.content = {
                    mode: "postList",
                    projectId: path[1].label,
                    dObjResult: { status: "loading" },
                };
                break;
            case "matchEntry":
                this.appViewProps.content = {
                    mode: "matchEntry",
                    matchId: path[2].label,
                    dObjResult: { status: "loading" },
                    updateCallback: this.renderPage.bind(this),
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
