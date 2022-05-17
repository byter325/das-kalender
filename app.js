const express = require('express');
const path = require('path');

const app = express();

app.get("/", (res, req) => {
    req.sendFile(path.join(__dirname, "src", "index.html"));
});

const server = app.listen(80, () => {
    console.log(server.address());
    const host = server.address().address;
    const port = server.address().port;
    console.log(`Listening on ${host}:${port}`);
})