import { urlencoded } from 'body-parser';
import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const groupsRouter = express.Router();

groupsRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    var group = XMLManager.getGroup(request.params.uid);
    if(group != null) return response.send(group)
    return response.sendStatus(404)
});

groupsRouter.get('/', (request:express.Request, response:express.Response) => {
    var groups = XMLManager.getAllGroups()
    if (groups != null) return response.send(groups)
    return response.sendStatus(404)
});

groupsRouter.post("/", (request:express.Request,response) => {
    
    var body = request.body

    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForGroup(body.group)
    }
    console.log(body);
    
    if (Utils.isBodyForGroupCorrect(body)){
        var b:boolean = XMLManager.insertGroup(body.uid, body.name, body.url, false)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
});

groupsRouter.delete("/:uid", (request: express.Request, response) => {
    var deleted: boolean = XMLManager.deleteGroup(request.params.uid)
    if(deleted) return response.sendStatus(200)
    return response.sendStatus(404)
});

groupsRouter.put("/:uid", (request: express.Request, response:express.Response) => {
    var body = request.body

    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForGroup(body.group)
    }
    console.log(body);

    if (Utils.isBodyForGroupCorrect(body)) {
        var b: boolean = XMLManager.insertGroup(body.uid, body.name, body.url, true)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})

export default groupsRouter;