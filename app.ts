import { Request, Response, Application } from "express";
import { Handlers } from "./lib/handlers"

const express = require('express');
const path = require('path');
const cron = require("node-cron");

const app: Application = express();

app.get("/api/getRaplaEvents/:course", Handlers.getRaplaEvents);

app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.use((req: Request, res: Response) => {
    res.status(404)
    res.send('404')
});

app.use((err: Error, req: Request, res: Response, next) => {
    console.error(err.message)
    res.status(500)
    res.send('500')
});

cron.schedule("0 */1 * * * *", () => {
    Handlers.fetchRaplaEvents("freudenmann", "TINF21B1");
});

const server = app.listen(80, () => {
    console.log(server.address());
    const host = server.address()["address"];
    const port = server.address()["port"];
    console.log(`Listening on ${host}:${port}`);
});