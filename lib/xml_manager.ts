import fs, {writeFileSync} from "fs"
import {User} from "./classes/user"
import {CalendarEvent} from "./classes/userEvent"
import {Utils} from "./utils"
import {XMLParser, XMLBuilder} from 'fast-xml-parser'

export module XMLManager{

    /**
     * Tries to find a user by its uid
     * 
     * @export
     * @param {string} uid unique user id
     * @return {User} Returns an object of the User class if the user exists
     * @return {null} Returns null if the user is not found
     */
    export function getUser(uid:string): User | null{
        try{
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributesGroupName: "group"
            })
            var path = "./data/users/" + Utils.GenSHA256Hash(uid) + ".xml"

            var data = fs.readFileSync(path, "utf-8")
            var person = parser.parse(data)["person"]
            var user = new User(person.uid, person.firstName, person.lastName, person.initials, person.mail, person.passwordHash,
                person.group, person.editableGroup, person.darkMode, person.isAdministrator)
            return user
        } catch (e) {
            console.log(e);
            return null
        }
    }
    
    /**
     * Tries to find a group by its uid
     * 
     * @export
     * @param {string} uid The unique group id
     * @return {any}  Returns an object if the group exists
     * @return {null} Returns null if the group is not found
     */
    export function getGroup(uid:string): any | null{
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
            })
            var path = "./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml"

            var data = fs.readFileSync(path, "utf-8")
            var group = parser.parse(data)['group']
            return group
        } catch (error) {
            console.log(error);
            return null
        }
    }

    /**
     * Tries to return an event according to its uid
     *
     * @export
     * @param {string} uid The unique (group or user) id
     * @param {string} eventUid The unique event id
     * @return {any}  Returns the event if it is found
     * @return {null} Returns null if the event is not found
     */
    export function getEvent(uid:string, eventUid:string):any{
        try {
            const parser = new XMLParser()
            var fullPath = "./data/events/"
            var data = fs.readFileSync(fullPath + "/" + Utils.GenSHA256Hash(uid) + ".xml")
            var events = parser.parse(data)["events"]
            if(events['event'] instanceof Object){
                console.log(events['event']);
                
                return events['event']
            } else {
                return events['event'].filter((event: { [x: string]: String }) => event['uid'] == eventUid)[0]
            }
        } catch (error) {
            console.log(error);
            return null
        }
    }


    /**
     * Inserts a user into the /users/ folder
     * Also creates an empty entry into /userEvents/
     *
     * @export
     * @param {User} user The user to be added
     * @return {*}  Returns if the operation was successful or not
     */
    export function insertUser(
        user: User): boolean {
        try {
            var json = {
                person: {
                    uid: user.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    initials: user.initials,
                    mail: user.mail,
                    passwordHash: user.passwordHash,
                    group: user.group,
                    editableGroup: user.editableGroup,
                    darkMode: user.darkMode,
                    isAdministrator: user.isAdministrator
                }
            }

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "group"
            })

            var xmlDataStr: string = builder.build(json)
            writeFileSync("./data/users/" + Utils.GenSHA256Hash(user.uid) + ".xml", xmlDataStr, {flag: "w+"})
            writeFileSync("./data/events/" + Utils.GenSHA256Hash(user.uid) + ".xml", "<events></events>", {flag: "w+"})
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

    /**
     * Inserts a group into the /group/ folder
     * Also creates an empty entry into /groupEvents/
     *
     * @export
     * @param {string} uid The id which is to  be given to the group
     * @param {string} name The name which is to be given to the group
     * @return {*} Returns if the operation was successful or not
     */
    export function insertGroup(uid:string,name:string):boolean{
        try{
            const builder = new XMLBuilder({})
            var xmlDataStr: string = builder.build({group: {uid: uid, name: name}})
            writeFileSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            writeFileSync("./data/events/" + Utils.GenSHA256Hash(uid) + ".xml", "<events></events>", {flag: "w+"})
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

    /**
     * Adds an event to a user's or a group's events
     * 
     * @export
     * @param {string} uid The unique (user or group) id
     * @param {CalendarEvent} event The event to be added
     * @return {*} Returns if the operation was successful or not
     */
    export function insertEvent(uid:string, event:CalendarEvent):boolean{
        try{
            var d = getAllEvents(uid)
            if(d == ''){
                d = {event:[]}
                d['event'].push(event)
            } else if (d instanceof Object) {
                d['event'] = [d['event']]
                d['event'].push(event)
            }

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event",
            })

            d = {events: d}
            var xmlDataStr: string = builder.build(d)
            writeFileSync("./data/events/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

    /**
     * Returns all events of a user or a group by its uid
     *
     * @export
     * @param {string} uid The unique (user or group) id
     * @return {any[]} Returns an empty array if no event entries exist or an array of events if multiple events exist 
     * @return {any} an object (if user has one event entry)
     * @return {null} Returns null if the operation failed
     */
    export function getAllEvents(uid:string):any{
        try {
            const parser = new XMLParser()
            var fullPath = "./data/events/"
            var data = fs.readFileSync(fullPath + Utils.GenSHA256Hash(uid) + ".xml", {encoding: "utf-8"})
            var events = parser.parse(data)["events"]
            return events
        } catch (error) {
            console.log(error);
            return null
        }
    }

    /**
     * Deletes a user and their entries by their uid
     *
     * @export
     * @param {string} uid The unique user id
     * @return {*}  Returns if the operation was successful or not
     */
    export function deleteUser(uid:string):boolean{
        try{
            fs.rmSync("./data/users/" + Utils.GenSHA256Hash(uid) + ".xml")
            fs.rmSync("./data/events/" + Utils.GenSHA256Hash(uid) + ".xml")
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }
    
    /**
     * Deletes a group and its entries by its uid
     *
     * @export
     * @param {string} uid The unique group id
     * @return {*}  Returns if the operation was successful or not
     */
    export function deleteGroup(uid:string):boolean{
        try{
            fs.rmSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml")
            fs.rmSync("./data/events/" + Utils.GenSHA256Hash(uid) + ".xml")
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /**
     * Generic version of deleteUserEvent and deleteGroupEvent
     * Reads all events of a user and tries to remove the specified one using its eventUid
     *
     * @param {string} uid The group or user that the event belongs to
     * @param {string} eventUid The unique event id
     * @return {*}  Returns if the operation was successful or not
     */
    export function deleteEvent(uid:string, eventUid:string):boolean{
        try{
            var events:any[] = getAllEvents(uid)['event']
            var filteredEvents:any[] = events.filter(event => event.uid != eventUid)
            
            var data = {events:{event:filteredEvents}}
                
            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event"
            })
            var xmlDataStr = builder.build(data)
            console.log(xmlDataStr);

            writeFileSync("./data/events/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }
}
