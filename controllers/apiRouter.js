const calendar = require('./Calendar.js')
const users = require('./Users.js')
const groups = require('./Groups.js')
const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.use('/calendar', calendar)
router.use('/users', users)
router.use('/groups', groups)

module.exports = router