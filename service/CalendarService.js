/**
 * Add a new event to the calendar
 *
 * body Event Event that needs to be added to the calendar
 * uid String UID of the user or group that owns the calendar
 * no response value expected for this operation
 **/
exports.createEvent = function (body, uid) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
}


/**
 * Delete an existing event
 *
 * uid String UID of the user or group that owns the calendar
 * eventID String UID of the event that should get deleted
 * no response value expected for this operation
 **/
exports.deleteEvent = function (uid, eventID) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
}


/**
 * Get one specific event from a calendar
 *
 * uid String UID of the user or group that owns the calendar
 * eventID String UID of the event that should get returned (optional)
 * returns Event
 **/
exports.getEvent = function (uid, eventID) {
    return new Promise(function (resolve, reject) {
        var examples = {};
        examples['application/json'] = {
            "uid": "uid",
            "presenter": [{
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }, {
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }],
            "start": "2000-01-23T04:56:07.000+00:00",
            "description": "description",
            "modified": "2000-01-23T04:56:07.000+00:00",
            "end": "2000-01-23T04:56:07.000+00:00",
            "location": "location",
            "title": "title",
            "category": "Lecture"
        }, {
            "uid": "uid",
            "presenter": [{
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }, {
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }],
            "start": "2000-01-23T04:56:07.000+00:00",
            "description": "description",
            "modified": "2000-01-23T04:56:07.000+00:00",
            "end": "2000-01-23T04:56:07.000+00:00",
            "location": "location",
            "title": "title",
            "category": "Lecture"
        };
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}

/**
 * Get all events from a calendar
 *
 * uid String UID of the user or group that owns the calendar
 * returns List
 **/
exports.getEvent = function (uid) {
    return new Promise(function (resolve, reject) {
        var examples = {};
        examples['application/json'] = [{
            "uid": "uid",
            "presenter": [{
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }, {
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }],
            "start": "2000-01-23T04:56:07.000+00:00",
            "description": "description",
            "modified": "2000-01-23T04:56:07.000+00:00",
            "end": "2000-01-23T04:56:07.000+00:00",
            "location": "location",
            "title": "title",
            "category": "Lecture"
        }, {
            "uid": "uid",
            "presenter": [{
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }, {
                "uid": "uid",
                "firstName": "firstName",
                "lastName": "lastName",
                "mail": "mail",
                "initials": "initials"
            }],
            "start": "2000-01-23T04:56:07.000+00:00",
            "description": "description",
            "modified": "2000-01-23T04:56:07.000+00:00",
            "end": "2000-01-23T04:56:07.000+00:00",
            "location": "location",
            "title": "title",
            "category": "Lecture"
        }];
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}

/**
 * Update an existing event
 *
 * body Event Event that needs to be updated in the calendar
 * eventID String UID of the event that should get updated
 * uid String UID of the user or group that owns the calendar
 * no response value expected for this operation
 **/
exports.updateEvent = function (body, eventID, uid) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
}

