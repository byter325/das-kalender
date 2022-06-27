import { Request, Response, Application } from "express";
import { Handlers } from "./lib/handlers";
import { Utils } from "./lib/utils";
import { XMLManager } from "./lib/xml_manager";
import * as path from "path";
import * as cron from "node-cron";
import express from "express";
import { Server } from "http";
import { XMLBuilder } from 'fast-xml-parser'
import { User } from "./lib/classes/user";

const app: Application = express();

app.use(express.static(path.join(__dirname, "app")));


app.get("/api/getActiveUser", (req: Request, res: Response) => {
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
app.get("/api/login", (req: Request, res: Response) => {
    if (Handlers.authenticate(req, res)) {
        res.status(200);
        res.send('login_success');
    } else {
        res.status(401);
        res.send('login_error');
    }
});

app.get("/api/getRaplaEvents/:course", (req: Request, res: Response) => {
    if (Handlers.authenticate(req, res)) { Handlers.getRaplaEvents(req, res); }
});

app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "app", "index.html"));
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
    Handlers.updateRaplaEvents("freudenmann", "TINF21B1");
});

const server: Server = app.listen(8080, () => {
    console.log(server.address());
    Handlers.updateRaplaEvents("freudenmann", "TINF21B1");
});
