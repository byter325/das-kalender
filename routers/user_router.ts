import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';
import { AuthManager } from "../lib/authManager";
import { XMLBuilder } from "fast-xml-parser";

const usersRouter = express.Router();

usersRouter.post("/", (request: express.Request, response) => {
    let body = request.body
    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForUser(body.person)
    }

    if (request.user.isAdministrator) {
        let correctness: number = Utils.isBodyForUserCorrect(body, true)
        if (correctness == Utils.BODY_PARTIALLY_CORRECT) {
            let b: boolean = XMLManager.insertUser(Utils.convertPartialPostBodyToUser(body), false, true)
            if (b) return response.sendStatus(201)
        } else if (correctness == Utils.BODY_FULLY_CORRECT) {
            let b: boolean = XMLManager.insertUser(Utils.convertFullPostBodyToUser(body), false, true)
            if (b) return response.sendStatus(201)
        }
        return response.sendStatus(400)
    } else return response.sendStatus(401)
});

usersRouter.get("/", (request: express.Request, response: express.Response) => {
    return response.status(200).send(XMLManager.getAllUsersAsXML())
});

usersRouter.get('/:uid', (request: express.Request, response: express.Response) => {
    if (request.user.uid == request.params.uid || request.user.isAdministrator) {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributesGroupName: "token"
        })
        var value = AuthManager.users.get(request.params.uid)
        if (value == undefined) {
            const uidAsNumber: any = + request.params.uid
            if (isNaN(uidAsNumber))
                value = undefined
            else
                value = AuthManager.users.get(uidAsNumber)
        }

        if (value != undefined) {
            value.passwordHash = ""
            const xmlDataStr = builder.build({ user: value })
            response.status(200)
            response.send(xmlDataStr)
        } else return response.sendStatus(404)
    } else return response.sendStatus(401)
});

usersRouter.put("/:uid", (request: express.Request, response: express.Response) => {
    let originalUser = AuthManager.users.get(request.params.uid)
    if (originalUser != undefined) {
        if (request.user.isAdministrator) {
            return response.sendStatus(XMLManager.updateUserAsAdmin(request.params.uid, request.body))
        } else if (request.user.uid == request.params.uid)
            return response.sendStatus(XMLManager.updateUser(request.params.uid, request.body))
        return response.sendStatus(401)
    }
    return response.sendStatus(404)
})

usersRouter.delete("/:uid", (request: express.Request, response) => {
    if (request.user.uid == request.params.uid || request.user.isAdministrator) {
        let deleted: boolean = XMLManager.deleteUser(request.params.uid)
        if (deleted) {
            AuthManager.deleteTokensOfUser(request.params.uid)
            AuthManager.loadUsers()
            return response.sendStatus(204)
        }
        return response.sendStatus(404)
    } else return response.sendStatus(401)
});

export default usersRouter;
