import express, {Application} from 'express'
import {AuthManager} from "./lib/authManager"
import usersRouter from "./routers/user_router"
import groupsRouter from "./routers/group_router"
import calendarRouter from "./routers/calendar_router"
import tokenRouter from "./routers/token_router"
import {Server} from 'http'
import {Handlers} from './lib/handlers'
import * as cron from "node-cron"
import * as https from "https"
import * as fs from "fs"
import * as fsPromises from "fs/promises"
import { Utils } from './lib/utils'

const path = require('path')
const RateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const xmlparser = require('express-xml-bodyparser')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const app: Application = express()
const port = 8080
const securityPath = path.join(__dirname, "security")

let key: Buffer;
let cert: Buffer;

async function loadCertificates() {
    await Utils.createDirectoryIfNotExists(securityPath);

    let keyPromis = fsPromises.readFile(path.join(securityPath, "server.key")).catch((err: Error) => {
        console.log("\x1b[31m%s\x1b[0m", "No server.key found. Did you forget to generate one?");
        process.exit(-1);
    });
    let certPromis = fsPromises.readFile(path.join(securityPath, "server.cert")).catch((err: Error) => {
        console.log("\x1b[31m%s\x1b[0m", "No server.cert found. Did you forget to generate one?");
        process.exit(-1);
    });
    return {"key":await keyPromis, "cert": await certPromis};
}

async function startServer() {

    let certificates = await loadCertificates();

    const server: Server = https.createServer(certificates, app).listen(port, () => {
        Handlers.updateRaplaEvents("freudenmann", "TINF21B1")
        AuthManager.loadUsers()
        AuthManager.loadTokens()

        console.log()
        console.log("\x1b[1m\x1b[5m\x1b[33m%s\x1b[0m\x1b[1m", '--------------------------------------------------------------------------------')
        console.log(`Success! Your application is running on port ${port}.`)
        console.log(`You can open Swagger-UI here:  https://localhost:${port}/docs`)
        console.log(`You can open the web UI here:  https://localhost:${port}/`)
        console.log("\x1b[1m\x1b[5m\x1b[33m%s\x1b[0m", '--------------------------------------------------------------------------------')
        console.log()
    })

    app.use(cookieParser())
    app.use(bodyParser.urlencoded())
    app.use(xmlparser())

    const routes = express.Router()

    /**
     * @description This checks if the user is logged in.
     */
    routes.use((req, res, next) => {
        const authToken = req.cookies['AuthToken'] || req.headers["AuthToken"]
        req.user = AuthManager.getUserFromToken(authToken)
        if (req.user != null) console.log("Successfully authenticated user: " + req.user.uid)
        next()
    })

    /**
     * @description This links the routers of the API to the application.
     */
    routes.use('/api/users', usersRouter)
    routes.use('/api/groups', groupsRouter)
    routes.use('/api/calendar', calendarRouter)
    routes.use('/api/token', tokenRouter)
    app.use(routes)

    app.use(express.static(path.join(__dirname, "app")))
    app.get("/", (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(__dirname, "app", "index.html"))
    })

    /**
     * @description This handles the login of the user on the website. If the credentials are correct, the uid and the AuthToken are returned as cookies.
     */
    app.post("/login", async (req: express.Request, res: express.Response) => {
        const user = req.body.loginMail;
        const pass = req.body.loginPassword;
        const userObject = await AuthManager.login(user, pass);
        if (userObject != null) {
            res.cookie('AuthToken', AuthManager.createTokenFor12H(userObject?.uid), {
                sameSite: 'strict',
                expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
                secure: true
            })
            res.cookie('UID', userObject?.uid, {
                sameSite: 'strict',
                expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
                secure: true
            })
            res.redirect("/")
        } else {
            res.sendStatus(400)
        }
    })

    /**
     * @description This handles the registration of the user on the website. The uid and the AuthToken are returned as cookies.
     */
    app.post("/register", async (req: express.Request, res: express.Response) => {
        const mail = req.body.registrationMail
        const pass = req.body.registrationPassword
        const firstname = req.body.registrationFirstName
        const lastname = req.body.registrationLastName
        const userObject = AuthManager.register(mail, pass, firstname, lastname)
        if (userObject != null) {
            res.cookie('AuthToken', AuthManager.createTokenFor12H((await userObject).uid))
            res.cookie('UID', (await userObject).uid)
            res.redirect("/")
        } else {
            res.sendStatus(400)
        }
    })

    /**
     * @description This handles the Swagger-UI.
     */
    const swaggerDocument = YAML.load('./openapi.yaml');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    cron.schedule("0 */15 * * * *", () => {
        Handlers.updateRaplaEvents("freudenmann", "TINF21B1")
    })
}

startServer();