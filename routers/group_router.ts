import { urlencoded } from 'body-parser';
import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const groupRouter = express.Router();

groupRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    return response.json(XMLManager.getGroup(request.params.uid));
});
groupRouter.use(urlencoded({extended:true}))
groupRouter.post("/", (request:express.Request,response) => {
    if (Utils.isBodyForGroupCorrect(request.body)){
        var b:boolean = XMLManager.insertGroup(request.body.uid, request.body.name)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
});

export default groupRouter;