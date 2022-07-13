import {Utils} from './utils';
import {XMLManager} from './xml_manager';
import {User} from "./classes/user";
import {Token} from "./classes/token";
import {randomUUID} from "crypto";

export module AuthManager {
    import getAllUsers = XMLManager.getAllUsers;
    import GenSHA256Hash = Utils.GenSHA256Hash;
    import getNextUID = Utils.getNextUID;
    import insertUser = XMLManager.insertUser;
    export let authTokens: Map<string, Token> = new Map<string, Token>()
    export let users: Map<string, User> = new Map<string, User>()

    /**
     * @description Loads all users from the XML file and stores them in the users map.
     */
    export async function loadUsers() {
        (await getAllUsers()).forEach(user => {
            users.set(user.uid, user)
        })
        if (users.size == 0) {
            let uid = "" + await getNextUID()
            let user = new User(uid, "Administrator", "Benutzer", "AB", "test@test.example", GenSHA256Hash("changeMe"), [], [], false, true)
            users.set(uid, user)
            await insertUser(user, false, true)
            console.log("No users available. Created admin user with eMail: 'test@test.example' and password: 'changeMe'")
        }
    }

    /**
     * @description Loads all tokens from the XML-File and stores them in the authTokens map.
     */
    export async function loadTokens() {
        const rawTokens = await XMLManager.getTokens()
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

    /**
     * @description Saves all valid authTokens to the XML file.
     */
    export async function saveTokens() {
        let xmlTokens = "<Tokens>"
        authTokens.forEach(async (value, key) => {
            if (await isTokenValid(key, false)) {
                xmlTokens += "<Token>"
                xmlTokens += "<tokenString>" + key + "</tokenString>"
                xmlTokens += "<uid>" + value.uid + "</uid>"
                xmlTokens += "<unlimited>" + value.unlimited + "</unlimited>"
                xmlTokens += "<validUntil>" + value.validUntil + "</validUntil>"
                xmlTokens += "</Token>"
            }
        })
        xmlTokens += "</Tokens>"
        await XMLManager.saveTokens(xmlTokens)
    }

    /**
     * @description Loads all users and checks if the given username and password are correct. If so, the user gets returned.
     * @param username  The username of the user.
     * @param password  The password of the user.
     */
    export async function login(username: string, password: string): Promise<User | null> {
        await loadUsers()
        let result = null
        users.forEach(user => {
            if ((user.mail == username || user.uid == username) && user.passwordHash === GenSHA256Hash(password)) {
                console.log(`User ${user.uid} logged in`)
                result = users.get(user.uid)
            }
        })
        return result
    }

    /**
     * @description Creates a new user and returns it.
     * @param mail      The mail address of the user.
     * @param password  The password of the user. The password will be hashed.
     * @param firstName The first name of the user.
     * @param lastName  The last name of the user.
     */
    export async function register(mail: string, password: string, firstName: string, lastName: string) {
        let user = new User("" + await getNextUID(), firstName, lastName, firstName.substring(0, 1), mail, Utils.GenSHA256Hash(password), [], [], false, false)
        users.set(user.uid, user)
        XMLManager.insertUser(user, false, true)
        return user
    }

    /**
     * @description hecks if the given token is valid and returns a boolean.
     * @param token         The token to check.
     * @param requiresAdmin If true, the token must be an admin token.
     */
    export async function isTokenValid(token: string, requiresAdmin: boolean = false): Promise<boolean> {
        await loadTokens()
        const t = authTokens.get(Utils.GenSHA256Hash(token))
        if (t != undefined) {
            const user = users.get(t.uid)
            if (new Date(t.validUntil) > new Date() && user != undefined) {
                return user.isAdministrator || !requiresAdmin
            } else {
                authTokens.delete(Utils.GenSHA256Hash(token))
                await saveTokens()
                return false
            }
        } else {
            return false
        }
    }

    /**
     * @description Returns the user object of the user with the given token
     * @param token The token to check.
     */
    export async function getUserFromToken(token: string): Promise<User | undefined> {
        if (await isTokenValid(token)) {
            const t = authTokens.get(Utils.GenSHA256Hash(token))
            if (t != undefined) {
                return users.get(t.uid)
            }
        }
    }

    /**
     * @description Returns all tokens of the user with the given uid
     * @param uid The uid of the user.
     */
    export function getTokensByUid(uid: string): String {
        let result = "<Tokens>"
        authTokens.forEach((value) => {
            if (value.uid == uid) {
                result += "<Token>"
                result += "<uid>" + value.uid + "</uid>"
                result += "<unlimited>" + value.unlimited + "</unlimited>"
                result += "<validUntil>" + value.validUntil + "</validUntil>"
                result += "</Token>"
            }
        })
        result += "</Tokens>"
        return result
    }

    /**
     * @description Creates a new token for the user with the given data.
     * @param uid           The uid of the user.
     * @param unlimited     If the token is unlimited.
     * @param validUntil    The date until the token is valid.
     */
    export async function createToken(uid: string, unlimited: boolean, validUntil: string): Promise<string> {
        let token = Utils.GenSHA256Hash(uid + new Date() + randomUUID())
        authTokens.set(Utils.GenSHA256Hash(token), new Token(uid, unlimited, validUntil))
        await saveTokens()
        console.log("Created new token " + new Token(uid, unlimited, validUntil) + " for user " + uid)
        return token
    }

    /**
     * @description Creates a new token for the user and returns it as a string. This token is valid for 12 hours.
     * @param uid The uid of the user.
     */
    export async function createTokenFor12H(uid: string): Promise<string> {
        return await createToken(uid, false, new Date(new Date().getTime() + 12 * 60 * 60 * 1000).toISOString())
    }

    /**
     * @description Deletes a token
     * @param token The token to delete.
     */
    export async function deleteToken(token: string) {
        authTokens.delete(Utils.GenSHA256Hash(token))
        await saveTokens()
        console.log("Deleted token " + token)
    }

    /**
     * @description This function deletes all tokens of a user.
     * @param uid The uid of the user whose tokens should be deleted.
     */
    export async function deleteTokensOfUser(uid: string) {
        authTokens.forEach((value, key) => {
            if (value.uid == uid) {
                authTokens.delete(key)
            }
        })
        await saveTokens()
        console.log("Deleted all tokens of user " + uid)
    }

}