const cron = require("node-cron");
const express = require('express');
const path = require('path');
const handlers = require('./lib/handlers')

const app = express();

app.use(express.static(__dirname + '/static'))

app.get("/api/getRaplaEvents/:course", handlers.getRaplaEvents);

app.use((req, res) => {
    res.status(404)
    res.send('404')
})

app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500)
    res.send('500')
})

cron.schedule("0 */15 * * * *", () => {
    handlers.fetchRaplaEvents("freudenmann", "TINF21B1")
})

const server = app.listen(8080, () => {
    console.log(server.address());
    const host = server.address().address;
    const port = server.address().port;
    console.log(`Listening on ${host}:${port}`);
});

