import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const usersRouter = express.Router();

usersRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    return response.send(XMLManager.getUser(request.params.uid))
});

usersRouter.post("/", (request: express.Request, response) => {
    var body = request.body

    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForUser(body.person)
    }
    console.log(body);

    var correctness: number = Utils.isBodyForUserCorrect(body, true)
    if (correctness == Utils.BODY_PARTIALLY_CORRECT) {
        var b: boolean = XMLManager.insertUser(Utils.convertPartialPostBodyToUser(body), false)
        if (b) return response.sendStatus(200)
    } else if (correctness == Utils.BODY_FULLY_CORRECT) {
        var b: boolean = XMLManager.insertUser(Utils.convertFullPostBodyToUser(body), false)
        if (b) return response.sendStatus(200)
    }
    response.status(400)
    return response.send("The request body is incorrectly formatted (" + correctness + ")")
});

usersRouter.delete("/:uid", (request: express.Request, response) => {
    var deleted: boolean = XMLManager.deleteUser(request.params.uid)
    if (deleted) return response.sendStatus(200)
    return response.sendStatus(404)
});

usersRouter.put("/:uid", (request: express.Request, response: express.Response) => {
    response.status(500)
    return response.send("Please delete the event and then insert it again")
})
export default usersRouter;