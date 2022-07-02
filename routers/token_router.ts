import * as express from 'express'
import {AuthManager} from "../lib/authManager";
import {XMLBuilder} from "fast-xml-parser";

const tokenRouter = express.Router();

tokenRouter.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'] || req.headers.authorization
    req.user = AuthManager.getUserFromToken(authToken);
    next();
})

tokenRouter.post("/", (request: express.Request, response) => {
    if (request.body.uid != undefined && request.body.unlimited != undefined && request.body.validUntil != undefined) {
        let token = AuthManager.createToken(request.body.uid, request.body.unlimited, request.body.validUntil)
        if (token != null) {
            response.send(token)
            response.sendStatus(201)
        }
    } else {
        response.sendStatus(400)
    }
})

tokenRouter.get("/", (request: express.Request, response) => {

    if (AuthManager.authTokens.size > 0) {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributesGroupName: "token"
        })
        const xmlDataStr = builder.build(AuthManager.authTokens.values())
        response.send(xmlDataStr)
        response.sendStatus(200)
    } else {
        response.sendStatus(404)
    }
})

tokenRouter.delete("/:uid", (request: express.Request, response) => {
    if (AuthManager.authTokens.delete(request.params.uid)) {
        response.sendStatus(204)
    } else {
        response.sendStatus(404)
    }
})