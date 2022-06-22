import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const usersRouter = express.Router();

usersRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    return response.send(XMLManager.getUser(request.params.uid))
});

usersRouter.post("/", (request: express.Request, response) => {
    var correctness: number = Utils.isBodyForUserCorrect(request.body, true)
    if (correctness == Utils.BODY_PARTIALLY_CORRECT) {
        var b: boolean = XMLManager.insertUser(Utils.convertPartialPostBodyToUser(request.body), false)
        if (b) return response.sendStatus(200)
    } else if (correctness == Utils.BODY_FULLY_CORRECT) {
        var b: boolean = XMLManager.insertUser(Utils.convertFullPostBodyToUser(request.body), false)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
});

usersRouter.delete("/:uid", (request: express.Request, response) => {
    var deleted: boolean = XMLManager.deleteUser(request.params.uid)
    if (deleted) return response.sendStatus(200)
    return response.sendStatus(404)
});

usersRouter.put("/:uid", (request: express.Request, response: express.Response) => {
    var correctness: number = Utils.isBodyForUserCorrect(request.body, true)
    if (correctness == Utils.BODY_PARTIALLY_CORRECT) {
        var b: boolean = XMLManager.insertUser(Utils.convertPartialPostBodyToUser(request.body), true)
        if (b) return response.sendStatus(200)
    } else if (correctness == Utils.BODY_FULLY_CORRECT) {
        var b: boolean = XMLManager.insertUser(Utils.convertFullPostBodyToUser(request.body), true)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})
export default usersRouter;