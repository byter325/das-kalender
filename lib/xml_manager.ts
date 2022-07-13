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
    export async function getUser(uid: string): Promise<string | null> {
        try {
            const path = PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml";
            return await Utils.readFile(path);
        } catch (e) {
            console.log(e);
            return null
        }
    }

    export async function getUserByUid(uid: string): Promise<User | null> {
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributesGroupName: "group"
            })
            const path = PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml"
            console.log("Reading file of user " + uid + " from " + path)
            if (!(await Utils.fileExists(path))) 
                throw new Error("File for user '" + uid + "' does not exist")

            const data = Utils.readFile(path);
            const person = parser.parse(await data)["person"]
            console.log("parsed person: " + person)
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
    export async function getGroup(uid: string): Promise<string | null> {
        try {
            let path = PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml"
            return await Utils.readFile(path);
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
    export async function getEvent(uid: string, eventUid: string): Promise<string | undefined> {
        try {
            const parser = new XMLParser()
            const builder = new XMLBuilder({})
            let data = Utils.readFile(PATH_DATA_EVENTS + "/" + Utils.GenSHA256Hash(uid) + ".xml");
            let events = parser.parse(await data)["events"]
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
     * @param {boolean} createOrOverrideEvents Whether the events file should be created or not
     * @return {boolean}  Returns if the operation was successful or not
     */
    export async function insertUser(user: User, allowOverride: boolean, createOrOverrideEvents: boolean): Promise<boolean> {
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
            let awaitable = createFoldersIfNotExist();

            console.log("Writing user '" + user.uid + "' to " + PATH_DATA_USERS + Utils.GenSHA256Hash(user.uid) + ".xml")

            const usersPath = PATH_DATA_USERS + Utils.GenSHA256Hash(user.uid) + ".xml"
            const eventsPath = PATH_DATA_EVENTS + Utils.GenSHA256Hash(user.uid) + ".xml"
            
            
            await awaitable;
            if (!allowOverride && await Utils.fileExists(usersPath))
                return false;
            else
                await Utils.writeFile(usersPath, xmlDataStr, {flag: "w+"})

            if (!allowOverride && await Utils.fileExists(eventsPath))
                return false;
            else {
                if (createOrOverrideEvents)
                    await Utils.writeFile(eventsPath, "<events></events>", {flag: "w+"})
            }

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
    export async function insertGroup(uid: string, name: string, url: string, allowOverride: boolean): Promise<boolean> {
        try {
            const builder = new XMLBuilder({})
            let xmlDataStr: string = builder.build({group: {uid: uid, name: name, url: url}});
            let awaitable = createFoldersIfNotExist()

            const groupsPath = PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml"
            const eventsPath = PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml"


            await awaitable;
            if (!allowOverride && await Utils.fileExists(groupsPath))
                return false;
            else
                await Utils.writeFile(groupsPath, xmlDataStr, {flag: "w+"})

            if (!allowOverride && await Utils.fileExists(eventsPath))
                return false;
            else
                await Utils.writeFile(eventsPath, "<events></events>", {flag: "w+"})

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
    export async function insertEvent(uid: string, event: CalendarEvent): Promise<boolean> {
        try {
            let eventsPromise = getAllEventsJSON(uid)

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event",
            })

            let events = await eventsPromise;
            console.log(events);

            events.event.push(event)
            events = {events: events}

            let xmlDataStr: string = builder.build(events)
            console.log(xmlDataStr);

            await Utils.writeFile(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
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
    export async function getAllEvents(uid: string): Promise<string> {
        try {
            return await Utils.readFile(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml")
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

    export async function getWeekEventsAsHTML(uid: string, startdate: string, enddate: string, timeline: boolean) {
        //fetch
        let boundaryStartDate = new Date(startdate);
        let boundaryEndDate = new Date(enddate);
        const builder = new XMLBuilder({attributesGroupName: "event"})

        let events = await getAllEventsJSON(uid);
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
            let awaitable = Utils.writeFile(path, xmlEvents);
            let htmlString: string
            console.log(timeline);
            if (timeline) {
                console.log("timeline");

                htmlString = Handlers.xmlEventsToHtmlTimelineView(path)
            } else {
                console.log("grid");

                htmlString = Handlers.xmlEventsToHtmlGridView(path);
            }
            await awaitable;
            await Utils.removeFile(path);

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
    async function getAllEventsJSON(uid: string): Promise<any> {
        const parser = new XMLParser({
            isArray(tagName) {
                return tagName == "event";

            },
        })
        let data = Utils.readFile(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", {encoding: "utf-8"})
        let events = parser.parse(await data)["events"]
        if (events == undefined || events == "")
            events = {event: []}
        return events;
    }

    /**
     * Deletes a user and their entries by their uid
     *
     * @export
     * @param {string} uid The unique user id
     * @return {boolean}  Returns if the operation was successful or not
     */
    export async function deleteUser(uid: string): Promise<boolean> {
        try {
            let a = Utils.removeFile(PATH_DATA_USERS + Utils.GenSHA256Hash(uid) + ".xml")
            let b = Utils.removeFile(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml")
            await a,b;
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
    export async function deleteGroup(uid: string): Promise<boolean> {
        try {
            let a = Utils.removeFile(PATH_DATA_GROUPS + Utils.GenSHA256Hash(uid) + ".xml");
            let b = Utils.removeFile(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml");
            await a,b;
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
    export async function deleteEvent(uid: string, eventUid: string): Promise<boolean> {
        try {
            let events: any[] = (await getAllEventsJSON(uid))['event'];
            let filteredEvents: any[] = events.filter(event => event.uid != eventUid);

            let data = {events: {event: filteredEvents}};

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event"
            })
            let xmlDataStr = builder.build(data);
            console.log(xmlDataStr);

            await Utils.writeFile(PATH_DATA_EVENTS + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
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
    export async function getAllGroups(): Promise<string> {
        try {
            const entriesPromise: Promise<string[]> = Utils.readDirectory(PATH_DATA_GROUPS);
            let xmlStr: string = "<groups>";
            const entries = await entriesPromise;
            for (const entry in entries) {
                if (Object.prototype.hasOwnProperty.call(entries, entry)) {
                    const element = entries[entry];
                    let data = Utils.readFile(PATH_DATA_GROUPS + "/" + element, "utf-8");
                    xmlStr = xmlStr.concat(await data)
                }
            }
            xmlStr = xmlStr.concat("</groups>")
            return xmlStr
        } catch (error) {
            console.log(error);
            return "<groups></groups>"
        }
    }

    export function convertXMLResponseJSONToCorrectJSONForEvent(xmlJSON: any) {
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
            uid: xmlJSON.uid != undefined ? xmlJSON.uid[0] : undefined,
            firstName: xmlJSON.firstname != undefined ? xmlJSON.firstname[0] : undefined,
            lastName: xmlJSON.lastname != undefined ? xmlJSON.lastname[0] : undefined,
            initials: xmlJSON.initials != undefined ? xmlJSON.initials[0] : undefined,
            mail: xmlJSON.mail != undefined ? xmlJSON.mail[0] : undefined,
            passwordHash: xmlJSON.passwordhash != undefined ? xmlJSON.passwordhash[0] : undefined,
            group: xmlJSON.group != undefined ? [xmlJSON.group.length] : undefined,
            editableGroup: xmlJSON.editablegroup != undefined ? [xmlJSON.editablegroup.length] : undefined,
            darkMode: xmlJSON.darkmode != undefined ? xmlJSON.darkmode[0] : undefined,
            isAdministrator: xmlJSON.isadministrator != undefined ? xmlJSON.isadministrator[0] : undefined
        }
        if (person.group != undefined) {
            for (let index = 0; index < xmlJSON.group.length; index++) {
                const element = xmlJSON.group[index];
                let group = {
                    uid: element.uid[0],
                    name: element.name[0]
                };
                person.group.push(group);
            }
        }
        if (person.editableGroup != undefined) {
            for (let index = 0; index < xmlJSON.editablegroup.length; index++) {
                const element = xmlJSON.editablegroup[index];
                let group = {
                    uid: element.uid[0],
                    name: element.name[0]
                };
                person.editableGroup.push(group);
            }
        }

        return person
    }

    export function convertXMLResponseJSONToCorrectJSONForGroup(xmlJSON: any) {
        return {
            uid: xmlJSON.uid[0],
            name: xmlJSON.name[0],
            url: xmlJSON.url[0],
        }
    }

    export async function getAllUsers(): Promise<User[]> {
        let result: User[] = [];
        try {
            const entriesPromise: Promise<string[]> = Utils.readDirectory(PATH_DATA_USERS);
            const entries = await entriesPromise;
            for (const entry in entries) {
                if (Object.prototype.hasOwnProperty.call(entries, entry)) {
                    const parser = new XMLParser({
                        ignoreAttributes: false,
                        attributesGroupName: "group"
                    })
                    const element = entries[entry];
                    let data = Utils.readFile(PATH_DATA_USERS + element, "utf-8");
                    const person = parser.parse(await data)["person"]
                    result.push(new User(person.uid, person.firstName, person.lastName, person.initials, person.mail, person.passwordHash,
                        person.group, person.editableGroup, person.darkMode, person.isAdministrator))
                }
            }
        } catch (error) {
            console.log(error);
        }
        return result
    }

    export async function getAllUsersAsXML(): Promise<string> {
        let builder = new XMLBuilder({})
        let users: User[] = await getAllUsers()
        let friendlyArray: any[] = []
        users.forEach(user => {
            user.passwordHash = ""
            friendlyArray.push(user)
        });
        console.log(friendlyArray);
        let xmlString: string = builder.build({user: friendlyArray})
        return "<users>" + xmlString + "</users>"
    }

    export async function getTokens() {
        const parser = new XMLParser()
        try {
            const data = Utils.readFile(PATH_TOKEN_FILE, {encoding: "utf-8"})
            return parser.parse(await data)["Tokens"]["Token"]
        } catch {
            return []
        }
    }

    export async function saveTokens(xmlString: string) {
        await Utils.writeFile(PATH_TOKEN_FILE, xmlString, {flag: "w+", encoding: "utf-8"})
    }

    export async function updateUser(uid: string, requestBody: any): Promise<number> {
        let json = convertXMLResponseJSONToCorrectJSONForUser(requestBody.user)
        let user: User | null = await getUserByUid(uid)

        if (user == undefined) return 404;

        if (json.isAdministrator != undefined || json.group != undefined || json.editableGroup != undefined) return 401
        if (json.firstName != undefined) user.firstName = json.firstName
        if (json.lastName != undefined) user.lastName = json.lastName
        if (json.initials != undefined) user.initials = json.initials
        if (json.mail != undefined) user.mail = json.mail
        if (json.darkMode != undefined) user.darkMode = json.darkMode
        if (json.passwordHash != undefined) user.passwordHash = json.passwordHash

        if (await insertUser(user, true, false)) return 204
        return 400
    }

    export async function updateUserAsAdmin(uid: string, requestBody: any): Promise<number> {
        let json = convertXMLResponseJSONToCorrectJSONForUser(requestBody.user)
        let user: User | null = await getUserByUid(uid)

        if (user == undefined || json == undefined) return 404;

        if (json.firstName != undefined) user.firstName = json.firstName
        if (json.lastName != undefined) user.lastName = json.lastName
        if (json.initials != undefined) user.initials = json.initials
        if (json.mail != undefined) user.mail = json.mail
        if (json.darkMode != undefined) user.darkMode = json.darkMode
        if (json.group != undefined) user.group = json.group
        if (json.editableGroup != undefined) user.editableGroup = json.editableGroup
        if (json.passwordHash != undefined) user.passwordHash = json.passwordHash
        if (json.isAdministrator != undefined) user.isAdministrator = json.isAdministrator

        if (await insertUser(user, true, false)) return 204
        return 400
    }

    async function createFoldersIfNotExist() {
        let a = Utils.createDirectoryIfNotExists(PATH_DATA_USERS);
        let b = Utils.createDirectoryIfNotExists(PATH_DATA_GROUPS);
        let c = Utils.createDirectoryIfNotExists(PATH_DATA_EVENTS);

        await a, b, c;
    }
}

