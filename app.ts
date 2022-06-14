import {Request, Response, Application} from "express";
import {Handlers} from "./lib/handlers";
import * as cron from "node-cron";

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app: Application = express();
const port = 8080;

app.use(bodyParser.urlencoded({extended: false}));
app.use(xmlparser());

app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});

app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req: Request, res: Response) => {
    res.status(404)
    res.send('404')
});

app.use((err: Error, req: Request, res: Response) => {
    console.error(err.message)
    res.status(500)
    res.send('500')
});

cron.schedule("0 */1 * * * *", () => {
    Handlers.fetchRaplaEvents("freudenmann", "TINF21B1");
});
