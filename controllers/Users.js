const Users = require('../service/UsersService');
const express = require('express')
const router = express.Router()

router.post("/", (req, res, next, body) => {
    Users.createUser(body)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.get("/", (req, res, next) => {
    Users.listUsers()
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.get("/:uid", (req, res, next, uid)  =>{
    Users.getUser(uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.put("/:uid", (req, res, next, body, uid) => {
    Users.updateUser(body, uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.delete("/:uid", (req, res, next, uid) => {
    Users.deleteUser(uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

module.exports = router