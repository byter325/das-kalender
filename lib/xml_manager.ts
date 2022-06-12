import fs, { writeFileSync } from "fs"
import { User } from "./classes/user"
import { CalendarEvent } from "./classes/userEvent"
import { Utils } from "./utils"

const {XMLParser, XMLBuilder} = require('fast-xml-parser')
export module XMLManager{

    export function getUserByUid(uid:string):User{
        const parser = new XMLParser({
            ignoreAttributes:false,
            attributeGroupPrefix:["group","editableGroup"]
        })
        var path = "./data/users/" + Utils.GenSHA256Hash(uid) + ".xml"
        
        var data = fs.readFileSync(path, "utf-8")
        var person = parser.parse(data)["person"]
        var user = new User(person.uid, person.firstName, person.lastName, person.initials, person.mail, person.passwordHash, 
            person.group, person.editableGroup, person.darkMode, person.isAdministrator)
        return user
    }
    
    export function getGroupByUid(uid:string):object{
        const parser = new XMLParser({
            ignoreAttributes:false,
        })
        var path = "./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml"
        
        var data = fs.readFileSync(path, "utf-8")
        var group = parser.parse(data)['group']
        return group
    }

    export function getUserEventByUserUIDAndEventUID(userUid:string, eventUid:string):object{
        return getEventByHashAndEventUID(userUid, eventUid,"userEvents")
    }

    export function getGroupEventByUserHashAndEventUID(groupUid:string, eventUid:string):object{
        return getEventByHashAndEventUID(groupUid, eventUid,"groupEvents")
    }

    export function getEventByHashAndEventUID(uid:string, eventUid:string, subPath:string):object{
        const parser = new XMLParser()
        var fullPath = "./data/" + subPath
        var data = fs.readFileSync(fullPath + "/" + Utils.GenSHA256Hash(uid) + ".xml")
        var events = parser.parse(data)["events"]
        return events['event'].filter((event: { [x: string]: String }) => event['uid'] == eventUid)[0]
    }


    export function insertUser(
        user:User):boolean {
        try{
            var json = {
                person:{
                    uid:user.uid,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    initials:user.initials,
                    mail:user.mail,
                    passwordHash:user.passwordHash,
                    group:user.group,
                    editableGroup:user.editableGroup,
                    darkMode:user.darkMode,
                    isAdministrator:user.isAdministrator
                }
            }
        
            const builder = new XMLBuilder({
                ignoreAttributes:false,
                attributeGroupName:["group","editableGroup"]
            })
        
            var xmlDataStr:string = builder.build(json)
            writeFileSync("./data/users/" + Utils.GenSHA256Hash(user.uid) + ".xml", xmlDataStr, {flag:"w+"})
            writeFileSync("./data/userEvents/" + Utils.GenSHA256Hash(user.uid) + ".xml", "<events></events>", {flag:"w+"})
            return true
        } catch (e){
            console.log(e);
            return false
        }
    }

    export function insertGroup(uid:string,name:string):boolean{
        try{
            const builder = new XMLBuilder()
            var xmlDataStr:string = builder.build({group:{uid:uid,name:name}})
            writeFileSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag:"w+"})
            writeFileSync("./data/groupEvents/" + Utils.GenSHA256Hash(uid) + ".xml", "<events></events>", {flag:"w+"})
            return true
        } catch(e){
            console.log(e);
            return false
        }
    }

    export function insertUserEvent(userUid:string, event:CalendarEvent){
        insertEvent(userUid, "userEvents", event)
    }

    export function insertGroupEvent(groupUid:string, event:CalendarEvent){
        insertEvent(groupUid, "groupEvents", event)
    }

    function insertEvent(uid:string, subPath:string, event:CalendarEvent){
        var d = getAllEvents(uid, subPath)
        if(d == ''){
            d = {event:[]}
            d['event'].push(event)
        } else if(d instanceof Object){
            d['event'] = [d['event']]
            d['event'].push(event)
        }
    
        const builder = new XMLBuilder({
            ignoreAttributes:false,
            attributeGroupName:["event"],
            arrayMode: "/event/"
        })

        d = {events:d}
        var xmlDataStr:string = builder.build(d)
        writeFileSync("./data/" + subPath + "/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag:"w+"})
    }

    export function getAllEvents(uid:string, subPath:string){
        const parser = new XMLParser()
        var fullPath = "./data/" + subPath + "/"
        var data = fs.readFileSync(fullPath + Utils.GenSHA256Hash(uid) + ".xml", {encoding:"utf-8"})
        var events = parser.parse(data)["events"]
        return events
    }

    export function deleteUser(uid:string):boolean{
        try{
            fs.rmSync("./data/users/" + Utils.GenSHA256Hash(uid))
            fs.rmSync("./data/userEvents/" + Utils.GenSHA256Hash(uid))
            return true
        } catch (e){
            console.log(e)
            return false
        }
    }
    
    export function deleteGroup(uid:string):boolean{
        try{
            fs.rmSync("./data/groups/" + Utils.GenSHA256Hash(uid))
            fs.rmSync("./data/groupEvents/" + Utils.GenSHA256Hash(uid))
            return true
        } catch (e){
            console.log(e)
            return false
        }
    }

    export function deleteUserEvent(userUID:string, eventUID:string):boolean{
        return deleteEvent(userUID, eventUID, "userEvents")
    }
    
    export function deleteGroupEvent(groupUID:string, eventUID:string):boolean{
        return deleteEvent(groupUID, eventUID, "groupEvents")
    }

    export function deleteEvent(uid:string, eventUid:string, subPath:string):boolean{
        try{
            var events:any[] = getAllEvents(uid, subPath)['event']
            var filteredEvents:any[] = events.filter(event => event.uid != eventUid)
            
            var data = {events:{event:filteredEvents}}
                
            const builder = new XMLBuilder({
                ignoreAttributes:false,
                attributeGroupName:["event"],
                arrayMode: "/event/"
            })
            var xmlDataStr = builder.build(data)
            console.log(xmlDataStr);
            
            writeFileSync("./data/" + subPath + "/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag:"w+"})
            return true
        } catch (e){
            console.log(e)
            return false
        }
    }
}


/* XMLManager.insertUserEvent("something", 
    new DataUserEvent("uidStuff", "A title", "A description",  {presenter:{name:"A presenter"}}, "lecture", new Date(), new Date(), "A268", new Date(), {modifiedBy:{name:"kollege roethig"}})) */
/* XMLManager.insertGroupEvent("uid", new CalendarEvent("groupEventUID", "A group event", "A description", {presenter:{name:"kollege roethig"}},
    "lecture", new Date(), new Date(), "Roethigs Buero", new Date(), {modifiedBy:{name:"kollege roethig"}})) */
console.log(XMLManager.getGroupByUid("uid"));
//console.log(XMLManager.deleteGroupEvent("uid", "groupEventUID"))
//console.log(getUserEventByUserHashAndEventUID("testUser", "1234"))
/* insertUser("something","Alex","Alexopoulos","alex@opoul.os", "passwort123",  
    [{uid:"UID1",name:"Group1"},{uid:"UID2",name:"Group2"}], [{uid:"E-UID1",name:"EditableGroup1"},{uid:"E-UID2",name:"EditableGroup2"}], true, true) */
//insertGroup("uid","group1")
