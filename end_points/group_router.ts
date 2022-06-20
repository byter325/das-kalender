import * as express from 'express'

const groupRouter = express.Router();

groupRouter.get('/', (request:express.Request, response:express.Response) => {
    return response.json("OK");
});

export default groupRouter;