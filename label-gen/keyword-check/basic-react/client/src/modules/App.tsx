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
};

export type PostListContent = {
    mode: "postList",
    list: any[],
};

export type PostContent = {
    mode: "post",
};

export type AppViewProps = {
    nav: NavigationProps;
    content: {
        mode: null,
    } | ProjectListContent | PostListContent | PostContent,
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
    private projectList: DynamicObject<any[]> | null = null;
    constructor(path: string, private targetElement: HTMLElement) {
        this.appViewProps.nav.path = this.calculatePath(path);
        this.appViewProps.nav.currentPathIndex = this.appViewProps.nav.path.length - 1;
        const mode = this.validatePathForMode(this.appViewProps.nav.path);

        this.setMode(mode);

        if (this.appViewProps.content.mode === "projectList") {
            this.projectList = new DynamicObject<any[]>("/api/project-index");
            this.projectList.onUpdate((storage) => {
                if (this.appViewProps.content.mode === "projectList") {
                    this.appViewProps.content.dObjResult = storage;
                    this.renderPage();
                }
            });
        }

    }
    public renderPage() {
        ReactDOM.render(
            <AppView {...this.appViewProps} />,
            this.targetElement,
        );
    }
    private calculatePath(rawPath: string) {
        const path: AppViewProps["nav"]["path"] = [];
        const parts = rawPath.split("/").slice(2);
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
    private validatePathForMode(path: AppViewProps["nav"]["path"]): AppViewProps["content"]["mode"] {
        if (path.length === 0) {
            console.log("Empty path detected, redirecting to \"/app/project\"");
            document.location.href = document.location.origin + "/app/project";
            return null;
        } else if (path.length === 1 && path[0].label === "project") {
            return "projectList";
        } else {
            console.log("Unknown path", path, "Redirecting to \"/app/project\"");
            document.location.href = document.location.origin + "/app/project";
            return null;
        }
    }
    private setMode(mode: AppViewProps["content"]["mode"]) {
        switch (mode) {
            case "projectList":
                this.appViewProps.content = {
                    mode: "projectList",
                    dObjResult: {
                        status: "loading",
                    },
                };
                break;
            default:
                this.appViewProps.content = {
                    mode: null,
                };
                break;
        }
    }
}
