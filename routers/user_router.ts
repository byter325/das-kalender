import * as express from 'express'
import {Utils} from '../lib/utils';
import {XMLManager} from '../lib/xml_manager';
import {AuthManager} from "../lib/authManager";
import {XMLBuilder} from "fast-xml-parser";
import {Token} from "../lib/classes/token";

const usersRouter = express.Router();

usersRouter.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'] || req.headers["AuthToken"]
    req.user = AuthManager.getUserFromToken(authToken);
    next();
})

usersRouter.get('/:uid', (request: express.Request, response: express.Response) => {
    if (request.user.uid == request.params.uid || request.user.isAdministrator) {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributesGroupName: "token"
        })
        const value = AuthManager.users.get(request.params.uid)
        if (value != undefined) {
            value.passwordHash = ""
            const xmlDataStr = builder.build(value)
            response.send(xmlDataStr)
            response.sendStatus(200)
        } else return response.sendStatus(404)
    } else return response.sendStatus(401)
});

usersRouter.post("/", (request: express.Request, response) => {
    if (request.user.isAdministrator) {
        let correctness: number = Utils.isBodyForUserCorrect(request.body, true)
        if (correctness == Utils.BODY_PARTIALLY_CORRECT) {
            var b: boolean = XMLManager.insertUser(Utils.convertPartialPostBodyToUser(request.body), false)
            if (b) return response.sendStatus(200)
        } else if (correctness == Utils.BODY_FULLY_CORRECT) {
            var b: boolean = XMLManager.insertUser(Utils.convertFullPostBodyToUser(request.body), false)
            if (b) return response.sendStatus(200)
        }
        return response.sendStatus(400)
    } else return response.sendStatus(401)
});

usersRouter.delete("/:uid", (request: express.Request, response) => {
    if (request.user.uid == request.params.uid || request.user.isAdministrator) {
        var deleted: boolean = XMLManager.deleteUser(request.params.uid)
        if (deleted) return response.sendStatus(200)
        return response.sendStatus(404)
    } else return response.sendStatus(401)
});

usersRouter.put("/:uid", (request: express.Request, response: express.Response) => {
    let originalUser = AuthManager.users.get(request.params.uid)
    if (originalUser != undefined) {
        if (request.user.uid == request.params.uid || request.user.isAdministrator) {
            if (!request.user.isAdministrator) {
                request.body.group = originalUser.group
                request.body.editableGroup = originalUser.editableGroup
                request.body.isAdministrator = originalUser.isAdministrator
            }

            let correctness: number = Utils.isBodyForUserCorrect(request.body, true)
            if (correctness == Utils.BODY_PARTIALLY_CORRECT) {
                let b: boolean = XMLManager.insertUser(Utils.convertPartialPostBodyToUser(request.body), true)
                if (b) return response.sendStatus(200)
            } else if (correctness == Utils.BODY_FULLY_CORRECT) {
                let b: boolean = XMLManager.insertUser(Utils.convertFullPostBodyToUser(request.body), true)
                if (b) return response.sendStatus(200)
            }
            return response.sendStatus(400)
        } else return response.sendStatus(401)
    } else return response.sendStatus(404)
})

export default usersRouter;