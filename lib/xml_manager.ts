import * as path from "path";
import fs, {writeFileSync} from "fs"
import {User} from "./classes/user"
import {CalendarEvent} from "./classes/userEvent"
import {Utils} from "./utils"
import {XMLBuilder, XMLParser} from 'fast-xml-parser'
import {Handlers} from "./handlers";

export module XMLManager {

    // TODO: Change folder structure to /events/
    const PATH_DATA_DIR: string = path.resolve(__dirname, '..', 'data')
    const PATH_DATA_USERS: string = `${PATH_DATA_DIR}/users/`
    const PATH_DATA_EVENTS: string = `${PATH_DATA_DIR}/events/`
    const PATH_DATA_GROUPS: string = `${PATH_DATA_DIR}/groups/`
    const PATH_TOKEN_FILE: string = `${PATH_DATA_DIR}/AuthTokens.xml`

    /**
     * Tries to find a user by its uid
     *
     * @export
     * @param {string} uid unique user id
     * @return {string} Returns an XML string of a user
     */
    export function getUser(uid: string): string | null {
        try {
            const path = PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml";
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
            const path = PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml"
            const data = fs.readFileSync(path, "utf-8")
            const person = parser.parse(data)["person"]
            return new User(person.uid, person.firstName, person.lastName, person.initials, person.mail, person.passwordHash,
                person.group, person.editableGroup, person.darkMode, person.isAdministrator)
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
    export function getGroup(uid: string): any | null {
        try {
            let path = PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml"
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
    export function getEvent(uid: string, eventUid: string): string | undefined {
        try {
            const parser = new XMLParser()
            const builder = new XMLBuilder({})
            let data = fs.readFileSync(PATH_DATA_EVENTS + "/" + Utils.GenSHA256Hash(uid) + ".xml");
            let events = parser.parse(data)["events"]
            if (events['event'] == "") {
                return undefined
            } else {
                let filteredEvents = events['event'].filter((event: { [x: string]: String }) => event['uid'] == eventUid)
                let firstElementAsXML = builder.build({event: filteredEvents[0]})
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
    export function insertUser(user: User, allowOverride: boolean): boolean {
        try {
            let json = {
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
            };

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "group"
            })

            let xmlDataStr: string = builder.build(json);
            createFoldersIfNotExist();

            const usersPath = PATH_DATA_USERS + Utils.GenSHA256Hash(user.uid) + ".xml"
            const eventsPath = PATH_DATA_EVENTS + Utils.GenSHA256Hash(user.uid) + ".xml"

            if (!allowOverride && fs.existsSync(usersPath))
                return false;
            else
                writeFileSync(usersPath, xmlDataStr, {flag: "w+"})

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
    export function insertGroup(uid: string, name: string, url: string, allowOverride: boolean): boolean {
        try {
            const builder = new XMLBuilder({})
            let xmlDataStr: string = builder.build({group: {uid: uid, name: name, url: url}});
            createFoldersIfNotExist()

            const groupsPath = PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml"
            const eventsPath = PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml"

            if (!allowOverride && fs.existsSync(groupsPath))
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
            var events = getAllEventsJSON(uid)
            
            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event",
            })
            console.log(events);
            
            events.event.push(event)
            events = {events: events}
            
            var xmlDataStr: string = builder.build(events)
            console.log(xmlDataStr);
            
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
    export function getAllEvents(uid: string): string {
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
    export function getAllEventsAsHTML(uid: string): string {
        return Handlers.xmlEventsToHtmlGridView(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml")
    }

    export function getWeekEventsAsHTML(uid: string, startdate: string, enddate: string, timeline:boolean) {
        //fetch
        let boundaryStartDate = new Date(startdate);
        let boundaryEndDate = new Date(enddate);
        const builder = new XMLBuilder({attributesGroupName: "event"})

        let events = getAllEventsJSON(uid);
        if (events == "") {
            return null
        } else if (Array.isArray(events['event'])) {
            let filteredEvents = events['event'].filter((event: { [x: string]: String }) => {
                let start = new Date(event['start'].toString());
                let end = new Date(event['start'].toString());
                if (start >= boundaryStartDate && end <= boundaryEndDate)
                    return event

            });
            let x = {event: filteredEvents};
            let xmlEvents = "<events>";
            xmlEvents += builder.build(x) + "</events>"

            let path = PATH_DATA_EVENTS + "tmp_" + Utils.GenSHA256Hash(uid) + ".xml";
            writeFileSync(path, xmlEvents)
            let htmlString = ""
            console.log(timeline);
            if(timeline){
                console.log("timeline");
                
                htmlString = Handlers.xmlEventsToHtmlTimelineView(path)
            }
            else {
                console.log("grid");
                
                htmlString = Handlers.xmlEventsToHtmlGridView(path);
            }
            fs.rmSync(path)
            return htmlString
        } else {
            return "This is an object"
        }
    }

    /**
     * Gets all events and returns as a JS object
     * For internal use only
     *
     * @param {string} uid The uid of the user or group
     * @return {*}  {*} Returns null or >= 1 event
     */
    function getAllEventsJSON(uid:string):any{
        const parser = new XMLParser({isArray(tagName, jPath, isLeafNode, isAttribute) {
            if(tagName == "event") return true
            return false
        },})
        var data = fs.readFileSync(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", { encoding: "utf-8" })
        var events = parser.parse(data)["events"]
        if(events == undefined || events == "")
            events = {event:[]}
        return events
    }

    /**
     * Deletes a user and their entries by their uid
     *
     * @export
     * @param {string} uid The unique user id
     * @return {boolean}  Returns if the operation was successful or not
     */
    export function deleteUser(uid: string): boolean {
        try {
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
    export function deleteGroup(uid: string): boolean {
        try {
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
    export function deleteEvent(uid: string, eventUid: string): boolean {
        try {
            let events: any[] = getAllEventsJSON(uid)['event'];
            let filteredEvents: any[] = events.filter(event => event.uid != eventUid);

            let data = {events: {event: filteredEvents}};

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event"
            })
            let xmlDataStr = builder.build(data);
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
    export function getAllGroups(): string {
        try {
            const entries: string[] = fs.readdirSync(PATH_DATA_GROUPS);
            let xmlStr: string = "<groups>";
            for (const entry in entries) {
                if (Object.prototype.hasOwnProperty.call(entries, entry)) {
                    const element = entries[entry];
                    let data = fs.readFileSync(PATH_DATA_GROUPS + "/" + element, "utf-8");
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

    export function convertXMLResponseJSONToCorrectJSONForEvent(xmlJSON:any){
        return {
            uid: xmlJSON.uid[0],
            presenter: {
                firstName: xmlJSON.presenter[0].firstname[0],
                lastName: xmlJSON.presenter[0].lastname[0],
                mail: xmlJSON.presenter[0].mail[0],
                initials: xmlJSON.presenter[0].initials[0],
            },
            start: xmlJSON.start[0],
            description: xmlJSON.description[0],
            modified: xmlJSON.modified[0],
            end: xmlJSON.end[0],
            location: xmlJSON.location[0],
            modifiedBy: {
                firstName: xmlJSON.modifiedby[0].firstname[0],
                lastName: xmlJSON.modifiedby[0].lastname[0],
                mail: xmlJSON.modifiedby[0].mail[0],
                initials: xmlJSON.modifiedby[0].initials[0],
            }, //This misspelling with a lower case b is caused by some express conversion from XML to JSON
            title: xmlJSON.title[0],
            category: xmlJSON.category[0]
        }
    }

    export function convertXMLResponseJSONToCorrectJSONForUser(xmlJSON: any) {
        let person = {
            uid: xmlJSON.uid[0],
            firstName: xmlJSON.firstname[0],
            lastName: xmlJSON.lastname[0],
            initials: xmlJSON.initials[0],
            mail: xmlJSON.mail[0],
            passwordHash: xmlJSON.passwordhash[0],
            group: [xmlJSON.group.length],
            editableGroup: [xmlJSON.group.length],
            darkMode: xmlJSON.darkmode[0],
            isAdministrator: xmlJSON.isadministrator[0]
        }
        for (let index = 0; index < xmlJSON.group.length; index++) {
            const element = xmlJSON.group[index];
            let group: any = {
                uid: element.uid[0],
                name: element.name[0]
            }
            person.group.push(group)
        }

        for (let index = 0; index < xmlJSON.editablegroup.length; index++) {
            const element = xmlJSON.editablegroup[index];
            let group: any = {
                uid: element.uid[0],
                name: element.name[0]
            }
            person.editableGroup.push(group)
        }

        return person
    }

    export function convertXMLResponseJSONToCorrectJSONForGroup(xmlJSON: any) {
        return {
            uid:xmlJSON.uid[0],
            name: xmlJSON.name[0],
            url: xmlJSON.url[0],
        }
    }

    export function getAllUsers(): User[] {
        let result: User[] = [];
        try {
            const entries: string[] = fs.readdirSync(PATH_DATA_USERS);
            for (const entry in entries) {
                if (Object.prototype.hasOwnProperty.call(entries, entry)) {
                    const parser = new XMLParser({
                        ignoreAttributes: false,
                        attributesGroupName: "group"
                    })
                    const element = entries[entry];
                    let data = fs.readFileSync(PATH_DATA_USERS + element, "utf-8");
                    const person = parser.parse(data)["person"]
                    result.push(new User(person.uid, person.firstName, person.lastName, person.initials, person.mail, person.passwordHash,
                        person.group, person.editableGroup, person.darkMode, person.isAdministrator))
                }
            }
        } catch (error) {
            console.log(error);
        }
        return result
    }

    export function getAllUsersAsXML():string{
        let builder = new XMLBuilder({})
        let users : User[] = getAllUsers()
        let friendlyArray : any[] = []
        users.forEach(user => {
            friendlyArray.push(user)
        });
        console.log(friendlyArray);
        let xmlString: string = builder.build({ user: friendlyArray })
        return "<users>" + xmlString + "</users>"
    }

    export function getTokens() {
        const parser = new XMLParser()
        try {
            const data = fs.readFileSync(PATH_TOKEN_FILE, {encoding: "utf-8"})
            return parser.parse(data)["tokens"]
        } catch {
            return []
        }
    }

    export function saveTokens(tokens: any) {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributesGroupName: "token"
        })
        const xmlDataStr = builder.build(tokens)
        console.log(xmlDataStr);
        writeFileSync(PATH_TOKEN_FILE, xmlDataStr, {flag: "w+"})
    }

    function createFoldersIfNotExist() {
        if (!fs.existsSync(PATH_DATA_EVENTS))
            fs.mkdirSync(PATH_DATA_EVENTS);

        if (!fs.existsSync(PATH_DATA_USERS))
            fs.mkdirSync(PATH_DATA_USERS);

        if (!fs.existsSync(PATH_DATA_GROUPS))
            fs.mkdirSync(PATH_DATA_GROUPS);
    }
}

