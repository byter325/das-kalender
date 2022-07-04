import {Utils} from './utils';
import {XMLManager} from './xml_manager';
import {User} from "./classes/user";
import {Token} from "./classes/token";

export module AuthManager {
    import getAllUsers = XMLManager.getAllUsers;
    import GenSHA256Hash = Utils.GenSHA256Hash;
    export let authTokens: Map<string, Token> = new Map<string, Token>()
    export let users: Map<string, User> = new Map<string, User>()

    function loadUsers() {
        getAllUsers().forEach(user => {
            users.set(user.uid, user)
        })
    }

    function loadTokens() {
        const rawTokens = XMLManager.getTokens()
        //iterate over all elements of the array and add them as Token to the map
        for (var i = 0; i < rawTokens.length; i++) {
            authTokens.set(rawTokens[i].token, new Token(rawTokens[i].uid, rawTokens[i].unlimited, rawTokens[i].validUntil))
        }
    }

    function saveTokens() {
        XMLManager.saveTokens(authTokens)
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
            if (t.validUntil > new Date() && user != undefined) {
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
    export function getUserFromToken(token: string): User | null {
        if (isTokenValid(token)) {
            const t = authTokens.get(token)
            if (t != undefined)
                return XMLManager.getUserByUid(t.uid)
        }
        return null
    }

    //creates a new token for the user
    export function createToken(uid: string, unlimited: boolean, validUntil: Date): string {
        let token = Utils.GenSHA256Hash(uid + new Date())
        console.log(`Token ${token} created for user ${uid}`)
        console.log(new Token(uid, unlimited, validUntil))
        authTokens.set(token, new Token(uid, unlimited, validUntil))
        saveTokens()
        return token
    }

    // create a new token for the user which is valid for 12 hours and not unlimited
    export function createTokenFor12H(uid: string): string {
        return createToken(uid, false, new Date(new Date().getTime() + 12 * 60 * 60 * 1000))
    }

    // deletes a token
    export function deleteToken(token: string) {
        authTokens.delete(token)
        saveTokens()
    }
}