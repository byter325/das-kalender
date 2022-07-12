import * as express from 'express'
import {Utils} from '../lib/utils';
import {XMLManager} from '../lib/xml_manager';

const calendarRouter = express.Router();

calendarRouter.post('/:uid', (request: express.Request, response) => {
    if (!(
        request.user.uid == request.params.uid ||
        request.user.editableGroup.uid == request.params.uid ||
        request.user.isAdministrator)) return response.sendStatus(401)

    let body = request.body
    const requestType = request.headers['content-type']
    if (requestType == "application/xml" || requestType == "text/html") {
        body = XMLManager.convertXMLResponseJSONToCorrectJSONForEvent(body.event)
    }

    if (Utils.isBodyForEventCorrect(request.body, false) >= Utils.BODY_PARTIALLY_CORRECT) {
        let b: boolean = XMLManager.insertEvent(request.params.uid, Utils.convertFullPostBodyToEvent(body))
        if (b) return response.sendStatus(201)
    }
    response.status(400)
    return response.send("Body is malformed")
})

calendarRouter.get('/:uid', (request: express.Request, response: express.Response) => {
    let eventID: string | undefined = request.query.eventID?.toString()
    let uid: string = request.params.uid
    let type: string | undefined = request.query.type?.toString()
    let start: string | undefined = request.query.start?.toString()
    let end: string | undefined = request.query.end?.toString()
    let timeline: boolean | undefined = Boolean(request.query.timeline?.toString())

    if (type == 'XML') {
        response.status(200)
        if (eventID == undefined)
            return response.send(XMLManager.getAllEvents(uid))
        else
            return response.send(XMLManager.getEvent(uid, eventID))
    } else if (type == "HTML") {
        if (eventID == undefined) {
            //return response.json(XMLManager.getAllEvents(uid))
            if (start == undefined || end == undefined)
                return response.sendStatus(404)
            if (timeline == undefined || !timeline)
                return response.status(200).send(XMLManager.getWeekEventsAsHTML(uid, start, end, false))
            else return response.status(200).send(XMLManager.getWeekEventsAsHTML(uid, start, end, true))
        } else {
            //return response.json(XMLManager.getEvent(uid, eventID))
            return response.status(200).send(XMLManager.getEvent(uid, eventID))
        }
    } else
        return response.sendStatus(400)
})

calendarRouter.put('/:uid', (request: express.Request, response) => {
    response.status(404)
    return response.send("This is not available yet. Please delete the event in question and then post the changed version.")
})

calendarRouter.delete('/:uid', (request: express.Request, response: express.Response) => {
    let eventID: string | undefined = request.query.eventID?.toString()
    if (eventID != undefined) {
        let b = XMLManager.deleteEvent(request.params.uid, eventID)
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})

export default calendarRouter;