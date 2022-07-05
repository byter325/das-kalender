import * as express from 'express'
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';
import {AuthManager} from "../lib/authManager";

const calendarRouter = express.Router();

calendarRouter.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'] || req.headers["AuthToken"]
    req.user = AuthManager.getUserFromToken(authToken);
    next();
})

//Die Query hierfür könnte folgendermaßen aussehen: localhost:8080/api/calendar/:uid?type=HTML&start=2022-01-01T10:00:00.000Z&end=2022-01-01T14:00:00.000Z
calendarRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    if (!(
        request.user.uid == request.params.uid ||
        request.user.group.uid == request.params.uid ||
        request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let eventID:string|undefined = request.query.eventID?.toString()
    let uid: string = request.params.uid
    let type:string | undefined = request.query.type?.toString()
    let start:string | undefined = request.query.start?.toString()
    let end:string | undefined = request.query.end?.toString()

    if (type == 'XML'){
        if(eventID == undefined)
            return response.send(XMLManager.getAllEvents(uid))
        else
            return response.send(XMLManager.getEvent(uid, eventID))
    } else if (type == "HTML") {
        if (eventID == undefined) {
            //return response.json(XMLManager.getAllEvents(uid))
            if(start == undefined || end == undefined)
                return response.sendStatus(404)
            return response.send(XMLManager.getWeekEventsAsHTML(uid, start, end))
        } else {
            //return response.json(XMLManager.getEvent(uid, eventID))
            return response.send(XMLManager.getEvent(uid, eventID))
        }
    } else
        return response.sendStatus(400)
});

calendarRouter.post('/:uid', (request: express.Request, response) => {
    
    if (!(
        request.user.uid == request.params.uid ||
        request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    var body = request.body
    const requestType = request.headers['content-type']
    if(requestType == "application/xml" || requestType == "text/html"){
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForEvent(request.body.event)
    }

    if (Utils.isBodyForEventCorrect(request.body, false) >= Utils.BODY_PARTIALLY_CORRECT) {
        var b: boolean = XMLManager.insertEvent(request.params.uid, Utils.convertFullPostBodyToEvent(body))
        if (b) return response.sendStatus(200)
    }
    response.status(400)
    return response.send("Body is malformed")
})

calendarRouter.delete('/:uid', (request:express.Request, response:express.Response) => {
    var eventID:string|undefined = request.query.eventID?.toString()
    if(eventID != undefined ){
        var b = XMLManager.deleteEvent(request.params.uid, eventID)
        if(b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})

export default calendarRouter;