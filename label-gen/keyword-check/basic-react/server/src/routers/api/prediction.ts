import { Request, Response, Router } from "express";
import * as WebSocket from "ws";

export function createRouter(wss: WebSocket.Server){

    let globalWs: WebSocket | undefined = undefined;

    wss.on("connection", (ws: WebSocket) => {

        console.log("new connection");

        ws.on('message', function incoming(message: any) {
            message = JSON.parse(message);
            console.log('received', message.id);
            waitQueue.get(message.id)(message.payload);
        });

        globalWs = ws;
    });

    const router = Router();
    let counter = 0;
    const waitQueue = new Map();

    router.all("/", function(req: Request, res: Response) {

        const text: string = req.body.text !== undefined ? req.body.text.toString() : "Test";
        const id = `${counter++}`;
        console.log(text);
        if(globalWs !== undefined && globalWs.readyState === WebSocket.OPEN){
            globalWs.send(JSON.stringify({
                id,
                payload: text,
            }));
            waitQueue.set(id, (obj: any)=>{
                res.send(JSON.stringify({
                    status: "ok",
                    payload: obj,
                }));
            })
        }
        else{
            res.send("Error");
        }
    });
    return router;
}
