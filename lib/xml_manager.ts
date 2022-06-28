import * as path from "path";
import fs, { writeFileSync } from "fs"
import { User } from "./classes/user"
import { CalendarEvent } from "./classes/userEvent"
import { Utils } from "./utils"
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { Handlers } from "./handlers";

export module XMLManager {

    // TODO: Change folder structure to /events/
    const PATH_DATA_DIR: string = path.resolve(__dirname, '..', 'data')
    const PATH_DATA_USERS: string = `${PATH_DATA_DIR}/users/`
    const PATH_DATA_EVENTS: string = `${PATH_DATA_DIR}/events/`
    const PATH_DATA_GROUPS: string = `${PATH_DATA_DIR}/groups/`

    /**
     * Tries to find a user by its uid
     * 
     * @export
     * @param {string} uid unique user id
     * @return {string} Returns an XML string of a user
     */
    export function getUser(uid:string): string | null{
        try{
            var path = PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml"
            return fs.readFileSync(path, "utf-8")
        } catch (e) {
            console.log(e);
            return null
        }
    }

    export function getUserByUid(uid: string): User | null {
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributesGroupName: "group"
            })
            var path = PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml"
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
     * @return {string}  Returns an XML string if the group exists
     */
    export function getGroup(uid:string): any | null{
        try {
            var path = PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml"
            return fs.readFileSync(path, "utf-8")
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
     * @return {string|undefined}  Returns the event as an XML string if found or nothing if not found
     */
    export function getEvent(uid:string, eventUid:string):string|undefined{
        try {
            const parser = new XMLParser()
            const builder = new XMLBuilder({})
            var data = fs.readFileSync(PATH_DATA_EVENTS + "/" + Utils.GenSHA256Hash(uid) + ".xml")
            var events = parser.parse(data)["events"]
            if(events['event'] == ""){
                return undefined
            } else {
                var filteredEvents = events['event'].filter((event: { [x: string]: String }) => event['uid'] == eventUid)
                var firstElementAsXML = builder.build({event:filteredEvents[0]})
                console.log("MULTIPLE EVENTS: " + filteredEvents + firstElementAsXML);
                
                return firstElementAsXML
            }
        } catch (error) {
            console.log(error);
            return undefined
        }
    }


    /**
     * Inserts a user into the /users/ folder
     * Also creates an empty entry into /userEvents/
     *
     * @export
     * @param {User} user The user to be added
     * @param {boolean} allowOverride Set to true to allow overriding existing users
     * @return {boolean}  Returns if the operation was successful or not
     */
    export function insertUser(user: User, allowOverride:boolean): boolean {
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
            createFoldersIfNotExist();

            const usersPath = PATH_DATA_USERS + Utils.GenSHA256Hash(user.uid) + ".xml"
            const eventsPath = PATH_DATA_EVENTS + Utils.GenSHA256Hash(user.uid) + ".xml"

            if (!allowOverride && fs.existsSync(usersPath))
                return false;
            else
                writeFileSync(usersPath, xmlDataStr, { flag: "w+" })

            if (!allowOverride && fs.existsSync(eventsPath))
                return false;
            else
                writeFileSync(eventsPath, "<events></events>", { flag: "w+" })
                
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
     * @param {string} url The url which will belong to the group
     * @param {boolean} allowOverride Set to true to allow overriding existing groups
     * @return {boolean} Returns if the operation was successful or not
     */
    export function insertGroup(uid:string,name:string,url:string, allowOverride:boolean):boolean{
        try{
            const builder = new XMLBuilder({})
            var xmlDataStr: string = builder.build({group: {uid: uid, name: name, url:url}})
            createFoldersIfNotExist()

            const groupsPath = PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml"
            const eventsPath = PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml"

            if(!allowOverride && fs.existsSync(groupsPath))
                return false;
            else 
                writeFileSync(groupsPath, xmlDataStr, {flag: "w+"})

            if (!allowOverride && fs.existsSync(eventsPath))
                return false;
            else    
                writeFileSync(eventsPath, "<events></events>", {flag: "w+"})

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
     * @return {boolean} Returns if the operation was successful or not
     */
    export function insertEvent(uid:string, event:CalendarEvent):boolean{
        try{
            var d = getAllEventsJSON(uid)

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
            writeFileSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
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
     * @return {string} Returns the events as an XML or "<events></events>" if none are found
     */
    export function getAllEvents(uid:string):string{
        try {
            return fs.readFileSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", {encoding: "utf-8"})
        } catch (error) {
            console.log(error);
            return "<events></events>"
        }
    }

    /**
     * Converts a users events into an HTML string
     *
     * @export
     * @param {string} uid The unique user or group id
     * @return {*}  {string} The HTML string
     */
    export function getAllEventsAsHTML(uid:string):string{
        return Handlers.xmlEventsToHtmlGridView(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml")
    }

    export function getWeekEventsAsHTML(uid:string, startdate:string, enddate:string){
        //fetch
        var boundaryStartDate = new Date(startdate)
        var boundaryEndDate = new Date(enddate)
        const builder = new XMLBuilder({attributesGroupName:"event"})

        var events = getAllEventsJSON(uid)
        if(events == ""){
            return null
        } else if(Array.isArray(events['event'])){
            var filteredEvents = events['event'].filter((event: { [x: string]: String }) => {
                var start = new Date(event['start'].toString())
                var end = new Date(event['start'].toString())
                if (start >= boundaryStartDate && end <= boundaryEndDate)
                    return event

            })
            var x = { event: filteredEvents }            
            var xmlEvents = "<events>"
            xmlEvents += builder.build(x) + "</events>"
            console.log(xmlEvents);

            var path = PATH_DATA_EVENTS + "tmp_" + Utils.GenSHA256Hash(uid) + ".xml"
            writeFileSync(path, xmlEvents)
            var htmlString = Handlers.xmlEventsToHtmlGridView(path)
            fs.rmSync(path)
            return htmlString
        } else {
            return "This is an object"
        }

        //write to tmp.xml
        //convert to html
        //delete tmp.xml
        //return
    }

    /**
     * Gets all events and returns as a JS object
     * For internal use only
     *
     * @param {string} uid The uid of the user or group
     * @return {*}  {*} Returns null or >= 1 event
     */
    function getAllEventsJSON(uid:string):any{
        const parser = new XMLParser()
        var data = fs.readFileSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", { encoding: "utf-8" })
        var events = parser.parse(data)["events"]
        return events
    }

    /**
     * Deletes a user and their entries by their uid
     *
     * @export
     * @param {string} uid The unique user id
     * @return {boolean}  Returns if the operation was successful or not
     */
    export function deleteUser(uid:string):boolean{
        try{
            fs.rmSync(PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml")
            fs.rmSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml")
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
     * @return {boolean} {boolean} Returns if the operation was successful or not
     */
    export function deleteGroup(uid:string):boolean{
        try{
            fs.rmSync(PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml")
            fs.rmSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml")
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /**
     * Reads all events of a group or user and tries to remove the specified one using its eventUid
     *
     * @param {string} uid The group or user that the event belongs to
     * @param {string} eventUid The unique event id
     * @return {boolean}  Returns if the operation was successful or not
     */
    export function deleteEvent(uid:string, eventUid:string):boolean{
        try{
            var events:any[] = getAllEventsJSON(uid)['event']
            var filteredEvents:any[] = events.filter(event => event.uid != eventUid)
            
            var data = {events:{event:filteredEvents}}
                
            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event"
            })
            var xmlDataStr = builder.build(data)
            console.log(xmlDataStr);

            writeFileSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /**
     * Tries to return all the groups as an XML string
     *
     * @export
     * @return {string}  {string} The XML string of all groups or just <groups></groups>
     */
    export function getAllGroups():string {
        try {
            var entries: string[] = fs.readdirSync(PATH_DATA_GROUPS)
            var xmlStr: string = "<groups>"
            for (const entry in entries) {
                if (Object.prototype.hasOwnProperty.call(entries, entry)) {
                    const element = entries[entry];
                    var data = fs.readFileSync(PATH_DATA_GROUPS + "/" + element, "utf-8")
                    xmlStr = xmlStr.concat(data)
                }
            }
            xmlStr = xmlStr.concat("</groups>")
            return xmlStr
        } catch (error) {
            console.log(error);
            return "<groups></groups>"
        }
    }

    function createFoldersIfNotExist() {
        if(!fs.existsSync(PATH_DATA_EVENTS)) 
            fs.mkdirSync(PATH_DATA_EVENTS);

        if(!fs.existsSync(PATH_DATA_USERS))
            fs.mkdirSync(PATH_DATA_USERS);

        if(!fs.existsSync(PATH_DATA_GROUPS))
            fs.mkdirSync(PATH_DATA_GROUPS);
    }
}

