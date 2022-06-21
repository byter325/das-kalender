import * as crypto from "crypto-js";
import { CalendarEvent } from "./classes/userEvent";

export module Utils{

    export function GenSHA256Hash(message: string): string{
        return crypto.SHA256(message).toString();
    }

    export function GenSHA512Hash(message:string): string{
        return crypto.SHA512(message).toString();
    }

    export function Hex2Word(message:string): crypto.lib.WordArray{
        return crypto.enc.Base64.parse(message);
    }
    
    export function Word2Hex(words:crypto.lib.WordArray):string{
        return crypto.enc.Utf8.stringify(words);
    }

    export function isBodyForGroupCorrect(body:any):boolean{
        if (body.name != undefined && body.uid != undefined) return true
        return false
    }

    export function isBodyForEventCorrect(body: any, allowPartialCorrectness:boolean): boolean {

        if (allowPartialCorrectness){
            if (body.uid != undefined
                && body.title != undefined
                && body.start != undefined
                && body.end != undefined) return true
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
                && body.modifiedBy != undefined) return true
        }
        return false
    }

    export function convertPostBodyToEvent(body:any):CalendarEvent{
        return new CalendarEvent(body.uid, body.title, body.description, body.presenter, body.category, body.start, body.end,
            body.location, body.modified, body.modifiedBy)
    }

    /*public uid:string
    public title:string
    public description:string
    public presenter:object
    public category:string
    public start:string
    public end:string
    public location:string
    public modified:string
    public modifiedBy:object */

}