import fs, { writeFileSync } from "fs"
import { Utils } from "./utils"

const {XMLParser, XMLBuilder} = require('fast-xml-parser')

function getUserByUid(uid:string){
    const parser = new XMLParser({
        ignoreAttributes:false,
        attributeGroupPrefix:["group","editableGroup"]
    })
    var path = "./data/users/" + Utils.GenSHA256Hash(uid) + ".xml"
    
    var data = fs.readFileSync(path, "utf-8")
    return parser.parse(data)["person"]
}

function getUserEventByUserUIDAndEventUID(userUid:string, eventUid:string):object{
    return getEventByHashAndEventUID(userUid, eventUid,"userEvents")
}

function getGroupEventByUserHashAndEventUID(groupUid:string, eventUid:string):object{
    return getEventByHashAndEventUID(groupUid, eventUid,"groupEvents")
}

function getEventByHashAndEventUID(uid:string, eventUid:string, subPath:string):object{
    const parser = new XMLParser()
    var fullPath = "./data/" + subPath
    var data = fs.readFileSync(fullPath + "/" + Utils.GenSHA256Hash(uid) + ".xml")
    var events = parser.parse(data)["events"]
    return events['event'].filter((event: { [x: string]: String }) => event['uid'] == eventUid)[0]
}

function insertUser(
    uid:string, firstName:string, lastName:string, mail:string, passwordHash:string,
    groups:any[], editableGroups:any[], darkMode:boolean, isAdmin:boolean):boolean {
    try{
        var json = {
            person:{
                uid:uid,
                firstName:firstName,
                lastName:lastName,
                initials:firstName[0]+lastName[0],
                mail:mail,
                passwordHash:passwordHash,
                group:groups,
                editableGroup:editableGroups,
                darkMode:darkMode,
                isAdministrator:isAdmin
            }
        }
    
        const builder = new XMLBuilder({
            ignoreAttributes:false,
            attributeGroupName:["group","editableGroup"]
        })
    
        var xmlDataStr:string = builder.build(json)
        writeFileSync("./data/users/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag:"w+"})
        return true
    } catch (e){
        console.log(e);
        return false
    }
}

function insertGroup(uid:string,name:string):boolean{
    try{
        const builder = new XMLBuilder()
        var xmlDataStr:string = builder.build({group:{uid:uid,name:name}})
        writeFileSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag:"w+"})
        return true
    } catch(e){
        console.log(e);
        return false
    }
}

function insertUserEvent(userUid:string){
}

console.log(getUserByUid("something"))
//console.log(getUserEventByUserHashAndEventUID("testUser", "1234"))
/* insertUser("something","Alex","Alexopoulos","alex@opoul.os", "passwort123",  
    [{uid:"UID1",name:"Group1"},{uid:"UID2",name:"Group2"}], [{uid:"E-UID1",name:"EditableGroup1"},{uid:"E-UID2",name:"EditableGroup2"}], true, true) */
//insertGroup("uid","group1")