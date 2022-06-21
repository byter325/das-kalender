import * as express from 'express'
import { XMLManager } from '../lib/xml_manager';

const groupRouter = express.Router();

groupRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    return response.json(XMLManager.getGroupByUid(request.params.uid));
});

export default groupRouter;