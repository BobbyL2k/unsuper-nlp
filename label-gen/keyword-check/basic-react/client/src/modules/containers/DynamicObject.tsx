import * as $ from "jquery";

export type Result<T> =
    {
        status: "loading",
    } | {
        status: "failed",
    } | {
        status: "done",
        data: T,
    };

export class DynamicObject<T> {
    private storage: Result<T> = { status: "loading" };
    private eventListeners: Array<(storage: Result<T>) => void> = [];
    constructor(public url: Readonly<string>) {
        this.requestData(this.url)
            .then(() => {
                console.log("Data loaded", this.storage);
            })
            .catch((err) => {
                console.log("Failed to load data", err);
            });
    }
    public onUpdate(eventListener: (storage: Result<T>) => void) {
        this.eventListeners.push(eventListener);
        if (this.storage.status === "done" || this.storage.status === "failed") {
            eventListener(this.storage);
        }
    }
    public rebindData(newUrl: string) {
        this.url = newUrl;
        this.storage.status = "loading";
        for (const eventListener of this.eventListeners) {
            eventListener(this.storage);
        }
        console.log("Loading new data");
        this.requestData(newUrl)
            .then(() => {
                console.log("New data loaded", this.storage);
            })
            .catch((err) => {
                console.log("Failed to load new data", err);
            });
    }
    private async requestData(requestPath: string) {
        try {
            this.storage = {
                status: "done",
                data: await $.getJSON(requestPath),
            };
        } catch (error) {
            this.storage = {
                status: "failed",
            };
        }
        for (const eventListener of this.eventListeners) {
            eventListener(this.storage);
        }
    }

}
