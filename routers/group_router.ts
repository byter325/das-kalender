import * as express from 'express'
import {Utils} from '../lib/utils';
import {XMLManager} from '../lib/xml_manager';

const groupsRouter = express.Router();

groupsRouter.post("/", (request: express.Request, response) => {
    if (!request.user.isAdministrator) return response.sendStatus(401)
    let body = request.body

    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForGroup(body.group)
        console.log(body);
    }

    if (Utils.isBodyForGroupCorrect(body)) {
        let b: boolean = XMLManager.insertGroup(body.name, body.url, false)
        console.log("SUCCESS?" + b);
        if (b) return response.sendStatus(201)
    }
    return response.sendStatus(400)
});

groupsRouter.get('/', (request: express.Request, response: express.Response) => {
    if (!request.user.isAdministrator) return response.sendStatus(401)

    let groups = XMLManager.getAllGroups()
    if (groups != null) return response.status(200).send(groups)
    return response.sendStatus(404)
});

groupsRouter.get('/:uid', (request: express.Request, response: express.Response) => {
    if (!(
        request.user.group.uid == request.params.uid ||
        request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let group = XMLManager.getGroup(request.params.uid);
    if (group != null) return response.status(200).send(group)
    return response.sendStatus(404)
});

groupsRouter.put("/:uid", (request: express.Request, response: express.Response) => {
    if (!(request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let body = request.body
    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForGroup(body.group)
    }

    if (Utils.isBodyForGroupCorrect(body)) {
        let b: boolean = XMLManager.insertGroup(body.name, body.url, true)
        console.log("SUCCESS?" + b);
        
        if (b) return response.sendStatus(204)
    }
    return response.sendStatus(400)
})

groupsRouter.delete("/:uid", (request: express.Request, response) => {
    if (!(request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let deleted: boolean = XMLManager.deleteGroup(request.params.uid)
    if (deleted) return response.sendStatus(204)
    return response.sendStatus(404)
});

export default groupsRouter;