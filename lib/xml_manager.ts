import fs, {writeFileSync} from "fs"
import {User} from "./classes/user"
import {CalendarEvent} from "./classes/userEvent"
import {Utils} from "./utils"
import {XMLParser, XMLBuilder} from 'fast-xml-parser'

export module XMLManager {

    export function getUserByUid(uid: string): any {
        try {
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

    export function getGroupByUid(uid: string): any {
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

    export function getUserEventByUserUIDAndEventUID(userUid: string, eventUid: string): any {
        return getEventByHashAndEventUID(userUid, eventUid, "userEvents")
    }

    export function getGroupEventByUserHashAndEventUID(groupUid: string, eventUid: string): any {
        return getEventByHashAndEventUID(groupUid, eventUid, "groupEvents")
    }

    export function getEventByHashAndEventUID(uid: string, eventUid: string, subPath: string): any {
        try {
            const parser = new XMLParser()
            var fullPath = "./data/" + subPath
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
            writeFileSync("./data/userEvents/" + Utils.GenSHA256Hash(user.uid) + ".xml", "<events></events>", {flag: "w+"})
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }


    export function insertGroup(uid: string, name: string): boolean {
        try {
            const builder = new XMLBuilder({})
            var xmlDataStr: string = builder.build({group: {uid: uid, name: name}})
            writeFileSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            writeFileSync("./data/groupEvents/" + Utils.GenSHA256Hash(uid) + ".xml", "<events></events>", {flag: "w+"})
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

    export function insertUserEvent(userUid: string, event: CalendarEvent): boolean {
        return insertEvent(userUid, "userEvents", event)
    }

    export function insertGroupEvent(groupUid: string, event: CalendarEvent): boolean {
        return insertEvent(groupUid, "groupEvents", event)
    }

    function insertEvent(uid: string, subPath: string, event: CalendarEvent): boolean {
        try {
            var d = getAllEvents(uid, subPath)
            if (d == '') {
                d = {event: []}
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
            writeFileSync("./data/" + subPath + "/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

    export function getAllEvents(uid: string, subPath: string): any {
        try {
            const parser = new XMLParser()
            var fullPath = "./data/" + subPath + "/"
            var data = fs.readFileSync(fullPath + Utils.GenSHA256Hash(uid) + ".xml", {encoding: "utf-8"})
            var events = parser.parse(data)["events"]
            return events
        } catch (error) {
            console.log(error);
            return null
        }
    }


    export function deleteUser(uid: string): boolean {
        try {
            fs.rmSync("./data/users/" + Utils.GenSHA256Hash(uid) + ".xml")
            fs.rmSync("./data/userEvents/" + Utils.GenSHA256Hash(uid) + ".xml")
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }


    export function deleteGroup(uid: string): boolean {
        try {
            fs.rmSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml")
            fs.rmSync("./data/groupEvents/" + Utils.GenSHA256Hash(uid) + ".xml")
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    export function deleteUserEvent(userUID: string, eventUID: string): boolean {
        return deleteEvent(userUID, eventUID, "userEvents")
    }

    export function deleteGroupEvent(groupUID: string, eventUID: string): boolean {
        return deleteEvent(groupUID, eventUID, "groupEvents")
    }

    function deleteEvent(uid: string, eventUid: string, subPath: string): boolean {
        try {
            var events: any[] = getAllEvents(uid, subPath)['event']
            var filteredEvents: any[] = events.filter(event => event.uid != eventUid)

            var data = {events: {event: filteredEvents}}

            const builder = new XMLBuilder({
                ignoreAttributes: false,
                attributesGroupName: "event"
            })
            var xmlDataStr = builder.build(data)
            console.log(xmlDataStr);

            writeFileSync("./data/" + subPath + "/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag: "w+"})
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }
}
