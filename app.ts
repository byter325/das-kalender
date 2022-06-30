const path = require('path');
import express, { Application } from 'express';
import { XMLManager } from "./lib/xml_manager";
import usersRouter from "./routers/user_router";
import groupsRouter from "./routers/group_router";
import calendarRouter from "./routers/calendar_router";
import { XMLBuilder } from 'fast-xml-parser';
import { Server } from 'http';
import { User } from './lib/classes/user';
import { Handlers } from './lib/handlers';
import { Utils } from './lib/utils';
import * as cron from "node-cron";
import * as https from "https";
import * as fs from "fs";

const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app: Application = express();
const port = 8080;
const securityPath = path.join(__dirname, "security");

if(!fs.existsSync(securityPath)) {
    console.log("No security folder found. Creating one...");
    fs.mkdirSync(securityPath);
    console.log("There is no certificate. If you want to create a certificate, look at the README under 'Security'. The server will close now...");
    process.exit(-1);
}

let key: Buffer;
let cert: Buffer;

try {
    key = fs.readFileSync(path.join(securityPath, "server.key"));
    cert = fs.readFileSync(path.join(securityPath, "server.cert"));
} catch (error) {
    console.log("There is no certificate. If you want to create a certificate, look at the README under 'Security'. The server will close now...");
    process.exit(-1);
}

const options = {
    key: key,
    cert: cert
};

const server: Server = https.createServer(options, app).listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
    console.log(`You can open Swagger-UI here:  http://localhost:${port}/docs`);
    console.log(server.address());
    Handlers.updateRaplaEvents("freudenmann", "TINF21B1");
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(xmlparser());

const routes = express.Router()
routes.use('/api/users', usersRouter);
routes.use('/api/groups', groupsRouter);
routes.use('/api/calendar', calendarRouter);
app.use(routes)

app.use(express.static(path.join(__dirname, "app")));

app.get("/api/getActiveUser", (req: express.Request, res: express.Response) => {
    if (Handlers.authenticate(req, res) && typeof req.headers.authorization != 'undefined') {
        const credentials: string = Utils.Word2Hex(Utils.Hex2Word(req.headers.authorization.split(' ')[1]));
        const uid: string = credentials.split(':')[0];
        const user: null | User = XMLManager.getUserByUid(uid);
        if(user != null) user.passwordHash = "";
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            tagValueProcessor: (tagname: string,tagvalue: string):string => {
                if(tagname != "passwordHash") return tagvalue;
                else return "";
            }
        });
        res.send(builder.build({person: user}));
    }
});

// user: public | pw: public
app.get("/api/login", (req: express.Request, res: express.Response) => {
    if (Handlers.authenticate(req, res)) {
        res.status(200);
        res.send('login_success');
    } else {
        res.status(401);
        res.send('login_error');
    }
});

app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, "app", "index.html"));
});

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

cron.schedule("0 */15 * * * *", () => {
    Handlers.updateRaplaEvents("freudenmann", "TINF21B1");
});
