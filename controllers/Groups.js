const Groups = require('../service/GroupsService.js');
const express = require('express')
const router = express.Router()

router.post("/", (req, res, next, body) => {
    Groups.createGroup(body)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.get("/", (req, res, next) => {
    Groups.listGroups()
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.put("/:uid", (req, res, next, body, uid) => {
    Groups.updateGroup(body, uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.delete("/:uid", (req, res, next, uid) => {
    Groups.deleteGroup(uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

module.exports = router