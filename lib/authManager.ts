import {Utils} from './utils';
import {XMLManager} from './xml_manager';
import {User} from "./classes/user";
import {Token} from "./classes/token";

export module AuthManager {
    import getAllUsers = XMLManager.getAllUsers;
    import GenSHA256Hash = Utils.GenSHA256Hash;
    import getNextUID = Utils.getNextUID;
    import insertUser = XMLManager.insertUser;
    export let authTokens: Map<string, Token> = new Map<string, Token>()
    export let users: Map<string, User> = new Map<string, User>()

    export function loadUsers() {
        getAllUsers().forEach(user => {
            users.set(user.uid, user)
        })
        if (users.size == 0) {
            let uid = "" + getNextUID()
            let user = new User(uid, "Administrator", "Benutzer", "AB", "test@test.example", GenSHA256Hash("changeMe"), [], [], false, true)
            users.set(uid, user)
            insertUser(user, false)
            console.log("No users available. Created admin user with eMail: 'test@test.example' and password: 'changeMe'")
        }
    }

    export function loadTokens() {
        const rawTokens = XMLManager.getTokens()
        if (rawTokens == undefined) return

        //iterate over all elements of the array and add them as Token to the map
        for (var i = 0; i < rawTokens.length; i++) {
            if (new Date(rawTokens[i].validUntil) > new Date()) {
                authTokens.set(
                    rawTokens[i].tokenString,
                    new Token(rawTokens[i].uid, rawTokens[i].unlimited, rawTokens[i].validUntil))
            } else console.log("Token " + rawTokens[i].tokenString + " is expired and will be deleted")
        }
        console.log("Loaded " + authTokens.size + " tokens")
    }

    export function saveTokens() {
        var xmlTokens = "<Tokens>"
        authTokens.forEach((value, key) => {
            xmlTokens += "<Token>"
            xmlTokens += "<tokenString>" + key + "</tokenString>"
            xmlTokens += "<uid>" + value.uid + "</uid>"
            xmlTokens += "<unlimited>" + value.unlimited + "</unlimited>"
            xmlTokens += "<validUntil>" + value.validUntil + "</validUntil>"
            xmlTokens += "</Token>"
        })
        xmlTokens += "</Tokens>"
        XMLManager.saveTokens(xmlTokens)
    }

    export function login(username: string, password: string): User | null {
        loadUsers()
        var result = null
        users.forEach(user => {
            if ((user.mail == username || user.uid == username) && user.passwordHash === GenSHA256Hash(password)) {
                console.log(`User ${user.uid} logged in`)
                result = users.get(user.uid)
            }
        })
        return result
    }

    export function register(mail: string, password: string, firstName: string, lastName: string) {
        let user = new User("U" + users.size + 1, firstName, lastName, firstName.substring(0, 1), mail, Utils.GenSHA256Hash(password), [], [], false, false)
        users.set(user.uid, user)
        XMLManager.insertUser(user, false)
        return user
    }

    //checks if the token is valid
    export function isTokenValid(token: string, requiresAdmin: boolean = false): boolean {
        loadTokens()
        const t = authTokens.get(token)
        if (t != undefined) {
            const user = users.get(t.uid)
            if (new Date(t.validUntil) > new Date() && user != undefined) {
                return user.isAdministrator || !requiresAdmin
            } else {
                authTokens.delete(token)
                saveTokens()
                return false
            }
        } else {
            return false
        }
    }

    //checks if the token is valid and returns the user
    export function getUserFromToken(token: string): User | undefined {
        if (isTokenValid(token)) {
            // console.log("Valid token " + token)
            const t = authTokens.get(token)
            if (t != undefined) {
                // console.log("Token value: " + t)
                return users.get(t.uid)
                // return XMLManager.getUserByUid(t.uid)
            }
        }
    }

    //returns all tokens with a specific uid
    export function getTokensByUid(uid: string): String {
        var result = "<Tokens>"
        authTokens.forEach((value, key) => {
            if (value.uid == uid) {
                result += "<Token>"
                // result += "<tokenString>" + key + "</tokenString>"
                result += "<uid>" + value.uid + "</uid>"
                result += "<unlimited>" + value.unlimited + "</unlimited>"
                result += "<validUntil>" + value.validUntil + "</validUntil>"
                result += "</Token>"
            }
        })
        result += "</Tokens>"
        return result
    }

    //creates a new token for the user
    export function createToken(uid: string, unlimited: boolean, validUntil: string): string {
        let token = Utils.GenSHA256Hash(uid + new Date())
        // console.log(`Token ${token} created for user ${uid}`)
        // console.log(new Token(uid, unlimited, validUntil))
        authTokens.set(token, new Token(uid, unlimited, validUntil))
        saveTokens()
        console.log("Created new token " + new Token(uid, unlimited, validUntil) + " for user " + uid)
        return token
    }

    // create a new token for the user which is valid for 12 hours and not unlimited
    export function createTokenFor12H(uid: string): string {
        return createToken(uid, false, new Date(new Date().getTime() + 12 * 60 * 60 * 1000).toISOString())
    }

    // deletes a token
    export function deleteToken(token: string) {
        authTokens.delete(token)
        saveTokens()
        console.log("Deleted token " + token)
    }

    // deletes all tokens of a user
    export function deleteTokensOfUser(uid: string) {
        authTokens.forEach((value, key) => {
            if (value.uid == uid) {
                authTokens.delete(key)
            }
        })
        saveTokens()
        console.log("Deleted all tokens of user " + uid)
    }
}