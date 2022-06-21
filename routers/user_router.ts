import * as express from 'express'
import { XMLManager } from '../lib/xml_manager';

const usersRouter = express.Router();

usersRouter.get('/:uid', (request:express.Request, response:express.Response) => {
    return response.send(XMLManager.getUser(request.params.uid))
});

export default usersRouter;