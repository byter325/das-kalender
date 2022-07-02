import express, { Application } from 'express'
import { AuthManager } from "./lib/authManager"
import usersRouter from "./routers/user_router"
import groupsRouter from "./routers/group_router"
import calendarRouter from "./routers/calendar_router"
import { Server } from 'http'
import { Handlers } from './lib/handlers'
import * as cron from "node-cron"
import * as https from "https"
import * as fs from "fs"

const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const xmlparser = require('express-xml-bodyparser')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const app: Application = express()
const port = 8080
const securityPath = path.join(__dirname, "security")

if(!fs.existsSync(securityPath)) {
    throw new Error("Security folder not found. Did you forget to add the folder and the certificate?")
}

const options = {
    key: fs.readFileSync(path.join(__dirname, "security", "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "security", "server.cert"))
};

const server: Server = https.createServer(options, app).listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`)
    console.log(`You can open Swagger-UI here:  http://localhost:${port}/docs`)
    console.log(server.address())
    Handlers.updateRaplaEvents("freudenmann", "TINF21B1")
})

app.use(cookieParser())
app.use(bodyParser.urlencoded())
app.use(xmlparser())

const routes = express.Router()
routes.use('/api/users', usersRouter)
routes.use('/api/groups', groupsRouter)
routes.use('/api/calendar', calendarRouter)
app.use(routes)

app.use(express.static(path.join(__dirname, "app")))

app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, "app", "index.html"))
})

// login handler
app.post("/login", (req: express.Request, res: express.Response) => {
    const user = req.body.loginMail
    const pass = req.body.loginPassword
    const userObject = AuthManager.login(user, pass)
    if (userObject != null) {
        res.cookie('AuthToken', AuthManager.createTokenFor12H(userObject.uid))
        res.cookie('UID', userObject.uid)
        res.redirect("/")
        // res.sendFile(path.join(__dirname, "app", "index.html"))
    } else {
        res.sendStatus(401)
    }
})

// register handler
app.post("/register", (req: express.Request, res: express.Response) => {
    const mail = req.body.registrationMail
    const pass = req.body.registrationPassword
    const firstname = req.body.registrationFirstName
    const lastname = req.body.registrationLastName
    const userObject = AuthManager.register(mail, pass, firstname, lastname)
    if (userObject != null) {
        res.cookie('AuthToken', AuthManager.createTokenFor12H(userObject.uid))
        res.cookie('UID', userObject.uid)
        res.redirect("/")
        // res.sendFile(path.join(__dirname, "app", "index.html"))
    } else {
        res.sendStatus(400)
    }
})

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

cron.schedule("0 */15 * * * *", () => {
    Handlers.updateRaplaEvents("freudenmann", "TINF21B1")
})