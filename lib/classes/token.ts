export class Token {
    uid: string
    unlimited: boolean
    validUntil: string

    constructor(uid: string, unlimited: boolean, validUntil: string) {
        this.uid = uid
        this.unlimited = unlimited
        this.validUntil = validUntil
    }
}