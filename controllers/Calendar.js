const Calendar = require('../service/CalendarService');
const express = require('express')
const router = express.Router()

router.post('/:uid', (req, res, next) => {
    Calendar.createEvent(req.body, req.params.uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.get('/:uid', (req, res, next) => {
    if(req.params.eventID != null) {
        Calendar.getEvent(req.params.uid, req.params.eventID)
            .then(function (response) {
                //TODO: successful return
            })
            .catch(function (response) {
                // utils.writeJson(res, response);
            })
    } else {
        Calendar.getEvent(req.params.uid)
            .then(function (response) {
                //TODO: successful return
            })
            .catch(function (response) {
                // utils.writeJson(res, response);
            })
    }
})

router.put('/:uid', (req, res, next, body, eventID, uid) => {
    Calendar.updateEvent(body, eventID, uid)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

router.delete('/:uid', (req, res, next, uid, eventID) => {
    Calendar.deleteEvent(uid, eventID)
        .then(function (response) {
            //TODO: successful return
        })
        .catch(function (response) {
            // utils.writeJson(res, response);
        })
})

module.exports = router