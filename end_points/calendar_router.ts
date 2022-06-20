import * as express from 'express'

const calendarRouter = express.Router();

calendarRouter.get('/', (request:express.Request, response:express.Response) => {
    return response.json("OK");
});

export default calendarRouter;