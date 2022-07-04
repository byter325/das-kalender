import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';
import {AuthManager} from "../lib/authManager";

const groupsRouter = express.Router();

groupsRouter.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'] || req.headers["AuthToken"]
    req.user = AuthManager.getUserFromToken(authToken);
    next();
})

groupsRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    if (!(
        request.user.uid == request.params.uid ||
        request.user.group.uid == request.params.uid ||
        request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let group = XMLManager.getGroup(request.params.uid);
    if(group != null) return response.send(group)
    return response.sendStatus(404)
});

groupsRouter.get('/', (request:express.Request, response:express.Response) => {
    if (!request.user.isAdministrator) return response.sendStatus(401)

    let groups = XMLManager.getAllGroups()
    if (groups != null) return response.send(groups)
    return response.sendStatus(404)
});

groupsRouter.post("/", (request:express.Request,response) => {
    if (!request.user.isAdministrator) return response.sendStatus(401)

    if (Utils.isBodyForGroupCorrect(request.body)){
        let b:boolean = XMLManager.insertGroup(request.body.uid, request.body.name, request.body.url, false)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
});

groupsRouter.delete("/:uid", (request: express.Request, response) => {
    if (!(request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let deleted: boolean = XMLManager.deleteGroup(request.params.uid)
    if(deleted) return response.sendStatus(200)
    return response.sendStatus(404)
});

groupsRouter.put("/:uid", (request: express.Request, response:express.Response) => {
    if (!(
        request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    if (Utils.isBodyForGroupCorrect(request.body)) {
        if(request.body.uid != request.params.uid) return response.sendStatus(400)
        let b: boolean = XMLManager.insertGroup(request.body.uid, request.body.name, request.body.url, true)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})

export default groupsRouter;