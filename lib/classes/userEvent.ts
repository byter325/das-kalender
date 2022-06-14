export class CalendarEvent {
    public uid: string
    public title: string
    public description: string
    public presenter: object
    public category: string
    public start: Date
    public end: Date
    public location: string
    public modified: Date
    public modifiedBy: object

    constructor(uid: string, title: string, description: string, presenter: object, category: string,
                start: Date, end: Date, location: string, modified: Date, modifiedBy: object) {
        this.uid = uid
        this.title = title
        this.description = description
        this.presenter = presenter
        this.category = category
        this.start = start
        this.end = end
        this.location = location
        this.modified = modified
        this.modifiedBy = modifiedBy
    }
}
