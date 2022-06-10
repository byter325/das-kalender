import fs, { writeFileSync } from "fs"
import { Utils } from "./utils"

const {XMLParser, XMLBuilder} = require('fast-xml-parser')

function getUserByHash(hash:String){
    const parser = new XMLParser({
        ignoreAttributes:false,
        attributeGroupPrefix:["group","editableGroup"]

    })
    var path = "./data/users/" + hash + ".xml"
    
    var data = fs.readFileSync(path, "utf-8")
    var x = parser.parse(data)["person"]
    return x
}

function getUserEventByUserHashAndEventUID(hash:String, uid:String){
    return getEventByHashAndEventUID(hash, uid, "userEvents")
}

function getGroupEventByUserHashAndEventUID(hash:String, uid:String){
    return getEventByHashAndEventUID(hash, uid, "groupEvents")
}

function getEventByHashAndEventUID(hash:String, uid:String, subPath:any){
    const parser = new XMLParser()
    var fullPath = "./data/" + subPath
    var data = fs.readFileSync(fullPath + "/" + hash + ".xml")
    var events = parser.parse(data)["events"]
    return events['event'].filter((event: { [x: string]: String }) => event['uid'] == uid)[0]
}

function insertUser(
    uid:string,
    firstName:string,
    lastName:string,
    mail:string,
    passwordHash:string,
    groups:any[],
    editableGroups:any[],
    darkMode:boolean,
    isAdmin:boolean
) {
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
}

function insertGroup(uid:string,name:string){
    const builder = new XMLBuilder()

    var xmlDataStr:string = builder.build({group:{uid:uid,name:name}})
    writeFileSync("./data/groups/" + Utils.GenSHA256Hash(uid) + ".xml", xmlDataStr, {flag:"w+"})
}

//console.log(getUserByHash("testUser"))
//console.log(getUserEventByUserHashAndEventUID("testUser", "1234"))
insertUser("something","Alex","Alexopoulos","alex@opoul.os", "passwort123",  
    [{uid:"UID1",name:"Group1"},{uid:"UID2",name:"Group2"}], [{uid:"E-UID1",name:"EditableGroup1"},{uid:"E-UID2",name:"EditableGroup2"}], true, true)
//insertGroup("uid","group1")