/**
 * Create a new group
 *
 * body Group XML document of the group you want to add
 * no response value expected for this operation
 **/
exports.createGroup = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete an existing group
 *
 * uid String UID of the group that gets deleted
 * no response value expected for this operation
 **/
exports.deleteGroup = function(uid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * List all groups
 *
 * returns Group
 **/
exports.listGroups = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "uid" : "uid",
  "name" : "name",
  "url" : "url"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Update an existing group
 *
 * body Group Updated XML document of the group
 * uid String UID of the group that is edited
 * no response value expected for this operation
 **/
exports.updateGroup = function(body,uid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

