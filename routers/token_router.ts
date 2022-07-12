import * as express from 'express'
import {AuthManager} from "../lib/authManager";

const tokenRouter = express.Router();

// tokenRouter.use((req, res, next) => {
//     const authToken = req.cookies['AuthToken'] || req.headers["AuthToken"]
//     req.user = AuthManager.getUserFromToken(authToken)
//     console.log(req.user)
//     // if (req.user == null) res.sendStatus(401)
//     next()
// })

tokenRouter.post("/", (request: express.Request, response) => {
    let body = request.body.token
    var token
    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        token = {
            uid: body.uid[0],
            unlimited: body.unlimited[0],
            validUntil: body.validuntil[0]
        }
    }
    console.log("Token to be generated: " + token)

    if (token != undefined && token.uid != undefined && (request.user.uid == token.uid || request.user.isAdministrator) && token.unlimited != undefined && token.validUntil != undefined) {
        let authToken = AuthManager.createToken(token.uid, token.unlimited, token.validUntil)
        if (authToken != null) {
            response.status(201)
            response.send(authToken)
            // response.sendStatus(201)
        }
    } else if (request.user.uid == request.body.uid) {
        response.sendStatus(401)
    } else response.sendStatus(400)
})

tokenRouter.get("/", (request: express.Request, response) => {
    if (request.user.uid == request.query.uid || request.user.isAdministrator) {
        if (AuthManager.authTokens.size > 0) {
            response.status(200)
            response.send(AuthManager.getTokensByUid(<string>request.query.uid))
            // response.sendStatus(200)
        } else {
            response.sendStatus(404)
        }
    } else response.sendStatus(401)
})

tokenRouter.delete("/", (request: express.Request, response) => {
    let token = <string>request.query.token
    let tokenValue = AuthManager.authTokens.get(token)
    if (tokenValue != undefined && (request.user.uid == tokenValue.uid || request.user.isAdministrator)) {
        if (request.user.uid == tokenValue.uid) {
            AuthManager.deleteToken(token)
            response.sendStatus(204)
        } else response.sendStatus(401)
    } else response.sendStatus(400)
})

export default tokenRouter;