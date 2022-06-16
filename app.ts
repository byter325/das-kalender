import { Request, Response, Application } from "express";
import { Handlers } from "./lib/handlers";
import { Utils } from "./lib/utils";
import * as path from "path";
import * as cron from "node-cron";
import express from "express";
import { Server } from "http";

const app: Application = express();

app.use(express.static(path.join(__dirname, "frontend", "app")));

// user: public | pw: public
app.get("/api/getRaplaEvents/:course", (req: Request, res: Response) => {
    if (Handlers.authenticate(req, res)) Handlers.getRaplaEvents(req, res)
});

app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "frontend", "app", "index.html"));
});

app.use((req: Request, res: Response) => {
    res.status(404)
    res.send('404')
});

app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error(err.message)
    res.status(500)
    res.send('500')
});

cron.schedule("0 */15 * * * *", () => {
    Handlers.fetchRaplaEvents("freudenmann", "TINF21B1");
});

const server:Server = app.listen(80, () => {
    console.log(server.address());
    Handlers.fetchRaplaEvents("freudenmann", "TINF21B1");
});
