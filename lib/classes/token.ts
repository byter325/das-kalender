export class Token {
    uid: string
    unlimited: boolean
    validUntil: Date

    constructor(uid: string, unlimited: boolean, validUntil: Date) {
        this.uid = uid
        this.unlimited = unlimited
        this.validUntil = validUntil
    }
}