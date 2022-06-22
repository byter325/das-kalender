import { urlencoded } from 'body-parser';
import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const groupsRouter = express.Router();

groupsRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    return response.json(XMLManager.getGroup(request.params.uid));
});

groupsRouter.get('/', (request:express.Request, response:express.Response) => {
    return response.json(XMLManager.getAllGroups());
});

groupsRouter.post("/", (request:express.Request,response) => {
    if (Utils.isBodyForGroupCorrect(request.body)){
        var b:boolean = XMLManager.insertGroup(request.body.uid, request.body.name, request.body.url, false)
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
    console.log(request.body);
    
    if (Utils.isBodyForGroupCorrect(request.body)) {
        if(request.body.uid != request.params.uid) return response.sendStatus(400)
        var b: boolean = XMLManager.insertGroup(request.body.uid, request.body.name, request.body.url, true)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})

export default groupsRouter;