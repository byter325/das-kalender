import * as crypto from "crypto-js";
import {User} from "./classes/user";
import {CalendarEvent} from "./classes/userEvent";
import fs from 'fs';
import * as fsPromises from "fs/promises";
import path from "path";

export module Utils {
    export const BODY_PARTIALLY_CORRECT = 0;
    export const BODY_FULLY_CORRECT = 1;
    export const BODY_INCORRECT = -1;

    let currUID = 0;
    let idFetched = false;
    const idDataPath = path.join(__dirname, "..", "data", "utils");
    const idDataFile = path.join(idDataPath, "id.json");

    export function GenSHA256Hash(message: string): string {
        return crypto.SHA256(message).toString();
    }

    export function isBodyForGroupCorrect(body: any): boolean {
        return body.name != undefined && body.uid != undefined && body.url != undefined;
    }

    /**
     * Checks if the body of a POST or PUT request has the correct data types
     *
     * @export
     * @param {*} body The body received by a POST or PUT request
     * @param {boolean} allowPartialCorrectness Whether or not all fields have to be correct
     * @return {*}  {number} 0: For partial correctness, 1: for full correctness, -1: for bad format
     */
    export function isBodyForEventCorrect(body: any, allowPartialCorrectness: boolean): number {

        if (allowPartialCorrectness) {
            if (body.uid != undefined
                && body.title != undefined
                && body.start != undefined
                && body.end != undefined) return BODY_PARTIALLY_CORRECT
        } else {
            if (body.uid != undefined
                && body.title != undefined
                && body.description != undefined
                && body.presenter != undefined
                && body.category != undefined
                && body.start != undefined
                && body.end != undefined
                && body.location != undefined
                && body.modified != undefined
                && body.modifiedBy != undefined) return BODY_FULLY_CORRECT
        }
        return BODY_INCORRECT
    }

    export function convertFullPostBodyToEvent(body: any): CalendarEvent {
        let o = new CalendarEvent(body.uid, body.title, body.description, body.presenter, body.category, body.start, body.end,
            body.location, body.modified, body.modifiedBy)
        console.log(o);

        return o
    }

    export function convertPartialPostBodyToEvent(body: any): CalendarEvent {
        return new CalendarEvent(body.uid, body.title, "No description", {}, "No category", body.start, body.end,
            "No location", new Date().toISOString(), {})
    }

    /**
     * Checks if the body of a POST or PUT request has the correct data types
     *
     * @export
     * @param {*} body The body received by a POST or PUT request
     * @param {boolean} allowPartialCorrectness Whether or not all fields have to be correct
     * @return {*}  {number} 0: For partial correctness, 1: for full correctness, -1: for bad format
     */
    export function isBodyForUserCorrect(body: any, allowPartialCorrectness: boolean): number {

        if (allowPartialCorrectness) {
            if (body.uid != undefined
                && body.firstName != undefined
                && body.lastName != undefined
                && body.mail != undefined
                && body.passwordHash != undefined) return BODY_PARTIALLY_CORRECT
        } else {
            if (body.uid != undefined
                && body.firstName != undefined
                && body.lastName != undefined
                && body.initials != undefined
                && body.mail != undefined
                && body.passwordHash != undefined
                && body.group != undefined
                && body.editableGroup != undefined
                && body.darkMode != undefined
                && body.isAdministrator != undefined) return BODY_FULLY_CORRECT
        }
        return BODY_INCORRECT
    }

    export function convertFullPostBodyToUser(body: any): User {
        return new User(body.uid, body.firstName, body.lastName, body.initials, body.mail, body.passwordHash, body.group,
            body.editableGroup, body.darkMode, body.isAdministrator)
    }

    export function convertPartialPostBodyToUser(body: any): User {
        return new User(body.uid, body.firstName, body.lastName, body.firstName[0] + body.lastName[0], body.mail, body.passwordHash, [{}],
            [{}], false, false)
    }

    export async function getNextUID(): Promise<number> {
        if (!idFetched) {
            currUID = await getLastUID();
            idFetched = true;
        }
        currUID++;
        saveUID(currUID);
        return currUID;
    }

    export async function createDirectoryIfNotExists(path: string): Promise<void> {
        if (!directoryExists(path)) {
            await fsPromises.mkdir(path);
        }
    }

    export async function fileExists(path: string): Promise<boolean> {
        try {
            await fsPromises.access(path);
            return true;
        } catch (err) {
            return false;
        }
    }

    export async function directoryExists(path: string): Promise<boolean> {
        return (await fsPromises.stat(path)).isDirectory();
    }

    export async function readFile(path: string): Promise<string> {
        return await fsPromises.readFile(path, "utf8");
    }

    async function saveUID(uid: number) {
        await createDirectoryIfNotExists(idDataPath);

        let data = {"uid": uid, "last_time": new Date().toISOString()};
        fs.writeFileSync(idDataFile, JSON.stringify(data));
    }

    async function getLastUID(): Promise<number> {
        await createDirectoryIfNotExists(idDataPath);

        if (await fileExists(idDataFile)) {
            let data = JSON.parse(await readFile(idDataFile));
            return data.uid;
        }
        return 0;
    }
}