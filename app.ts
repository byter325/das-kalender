import {Request, Response, Application} from "express";
import {Handlers} from "./lib/handlers";
import * as cron from "node-cron";

const path = require('path');
import express from 'express';
import { XMLManager } from "./lib/xml_manager";
import usersRouter from "./routers/user_router";
import groupsRouter from "./routers/group_router";
import calendarRouter from "./routers/calendar_router";
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app: Application = express();
const port = 8080;

app.use(bodyParser.urlencoded({extended: false}));
app.use(xmlparser());

const routes = express.Router()
routes.use('/api/users', usersRouter);
routes.use('/api/groups', groupsRouter);
routes.use('/api/calendar', calendarRouter);
app.use(routes)

app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
    console.log(`You can open Swagger-UI here:  http://localhost:${port}/docs`);
app.use(express.static(path.join(__dirname, "app")));
});

// user: public | pw: public
app.get("/api/getRaplaEvents/:course", (req: Request, res: Response) => {
    if (Handlers.authenticate(req, res)) Handlers.getRaplaEvents(req, res)
});

app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "app", "index.html"));
});

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//app.use('/api', new ApiRouter().router)

// user: public | pw: public
// legacy, will be removed soon
app.get("/api/getRaplaEvents/:course", (req: Request, res: Response) => {
    if (Handlers.authenticate(req, res)) Handlers.getRaplaEvents(req, res)
});


app.use((req: Request, res: Response) => {
    res.status(404)
    res.send('404 - Not found')
});

app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error(err.message)
    res.status(500)
    res.send('500 - Internal Error')
});

cron.schedule("0 */15 * * * *", () => {
    Handlers.fetchRaplaEvents("freudenmann", "TINF21B1");
});