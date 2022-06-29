import * as express from 'express'
import { CalendarEvent } from '../lib/classes/userEvent';
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const calendarRouter = express.Router();

//Die Query hierfür könnte folgendermaßen aussehen: localhost:8080/api/calendar/:uid?type=HTML&start=2022-01-01T10:00:00.000Z&end=2022-01-01T14:00:00.000Z
calendarRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    var eventID:string|undefined = request.query.eventID?.toString()
    var uid: string = request.params.uid
    var type:string | undefined = request.query.type?.toString()
    var start:string | undefined = request.query.start?.toString()
    var end:string | undefined = request.query.end?.toString()

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
    if (Utils.isBodyForEventCorrect(request.body, false) >= Utils.BODY_PARTIALLY_CORRECT) {
        var b: boolean = XMLManager.insertEvent(request.params.uid, Utils.convertFullPostBodyToEvent(request.body))
        if (b) return response.sendStatus(200)
    }
    response.status(400)
    return response.send("Body is malformed")
})

export default calendarRouter;