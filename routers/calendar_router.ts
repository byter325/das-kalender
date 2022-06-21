import * as express from 'express'
import { XMLManager } from '../lib/xml_manager';

const calendarRouter = express.Router();

calendarRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    var eventID:string|undefined = request.query.eventID?.toString()
    var uid: string = request.params.uid

    if(eventID == undefined){
        return response.json(XMLManager.getAllEvents(uid))
    } else{
        return response.json(XMLManager.getEventByUIDAndEventUID(uid, eventID))
    }
});

export default calendarRouter;