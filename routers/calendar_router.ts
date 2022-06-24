import * as express from 'express'
import { CalendarEvent } from '../lib/classes/userEvent';
import { Utils } from '../lib/utils';
import { XMLManager } from '../lib/xml_manager';

const calendarRouter = express.Router();

calendarRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    var eventID:string|undefined = request.query.eventID?.toString()
    var uid: string = request.params.uid

    if(eventID == undefined){
        //return response.json(XMLManager.getAllEvents(uid))
        return response.send("THIS SHOULD BE HTML")
    } else{
        //return response.json(XMLManager.getEvent(uid, eventID))
        return response.send("THIS SHOULD BE HTML")
    }
});

calendarRouter.post('/:uid', (request: express.Request, response) => {
    if (Utils.isBodyForEventCorrect(request.body, true)) {
        var b: boolean = XMLManager.insertEvent(request.body.uid, Utils.convertFullPostBodyToEvent(request.body))
        if (b) return response.sendStatus(200)
    }
    return response.sendStatus(400)
})

export default calendarRouter;