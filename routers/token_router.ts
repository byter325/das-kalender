import * as express from 'express'
import {AuthManager} from "../lib/authManager";
import {XMLBuilder} from "fast-xml-parser";
import {Token} from "../lib/classes/token";

const tokenRouter = express.Router();

tokenRouter.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'] || req.headers["AuthToken"]
    req.user = AuthManager.getUserFromToken(authToken);
    next();
})

tokenRouter.post("/", (request: express.Request, response) => {
    if (request.user.uid == request.body.uid && request.body.uid != undefined && request.body.unlimited != undefined && request.body.validUntil != undefined) {
        let token = AuthManager.createToken(request.body.uid, request.body.unlimited, request.body.validUntil)
        if (token != null) {
            response.send(token)
            response.sendStatus(201)
        }
    } else if (request.user.uid == request.body.uid) {
        response.sendStatus(401)
    } else response.sendStatus(400)
})

tokenRouter.get("/", (request: express.Request, response) => {
    if (request.user.uid == request.query.uid) {
        if (AuthManager.authTokens.size > 0) {
            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "token"
            })

            let values: Token[] = []
            //get Value from AuthManager.authTokens where value.uid == request.user.uid
            AuthManager.authTokens.forEach((value) => {
                if (value.uid == request.user.uid) {
                    values.push(value)
                }
            })
            const xmlDataStr = builder.build(values)
            response.send(xmlDataStr)
            response.sendStatus(200)
        } else {
            response.sendStatus(404)
        }
    } else response.sendStatus(401)
})

tokenRouter.delete("/", (request: express.Request, response) => {
    let token = <string>request.query.token
    let tokenValue = AuthManager.authTokens.get(token)
    if (tokenValue != undefined) {
        if (request.user.uid == tokenValue.uid) {
            AuthManager.deleteToken(token)
            response.sendStatus(204)
        } else response.sendStatus(401)
    } else response.sendStatus(400)
})