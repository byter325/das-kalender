import * as crypto from "crypto-js";

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

}