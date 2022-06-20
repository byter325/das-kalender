/**
 * Create a new user
 *
 * body Person XML document of the user you want to add
 * no response value expected for this operation
 **/
exports.createUser = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete an existing user
 *
 * uid String UID of the user that gets deleted
 * no response value expected for this operation
 **/
exports.deleteUser = function(uid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get all user info
 *
 * uid String UID of the user that is edited
 * returns Person
 **/
exports.getUser = function(uid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "uid" : "uid",
  "firstName" : "firstName",
  "lastName" : "lastName",
  "mail" : "mail",
  "initials" : "initials",
  "darkMode" : true,
  "isAdministrator" : true,
  "passwordHash" : "passwordHash",
  "group" : [ {
    "uid" : "uid",
    "name" : "name",
    "url" : "url"
  }, {
    "uid" : "uid",
    "name" : "name",
    "url" : "url"
  } ],
  "editableGroup" : [ null, null ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * List all users
 *
 * returns PersonInfo
 **/
exports.listUsers = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "uid" : "uid",
  "firstName" : "firstName",
  "lastName" : "lastName",
  "mail" : "mail",
  "initials" : "initials"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Update an existing user
 *
 * body Person Updated XML document of the user
 * uid String UID of the user that is edited
 * no response value expected for this operation
 **/
exports.updateUser = function(body,uid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

