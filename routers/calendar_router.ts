import * as express from 'express'
import { CalendarEvent } from '../lib/classes/userEvent';
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const calendarRouter = express.Router();

calendarRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    var eventID:string|undefined = request.query.eventID?.toString()
    var uid: string = request.params.uid
    var type:string | undefined = request.query.type?.toString()

    if (type == 'XML'){
        if(eventID == undefined)
            return response.send(XMLManager.getAllEvents(uid))
        else
            return response.send(XMLManager.getEvent(uid, eventID))
    } else if (type == "HTML") {
        if (eventID == undefined) {
            //return response.json(XMLManager.getAllEvents(uid))
            return response.send(XMLManager.getAllEventsAsHTML(uid))
        } else {
            //return response.json(XMLManager.getEvent(uid, eventID))
            return response.send("PLACEHOLDER: THIS SHOULD BE HTML")
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