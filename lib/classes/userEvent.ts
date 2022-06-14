export class CalendarEvent{
    public uid:string
    public title:string
    public description:string
    public presenter:object
    public category:string
    public start:string
    public end:string
    public location:string
    public modified:string
    public modifiedBy:object
    constructor(uid:string, title:string, description:string, presenter:object, category:string,
        start:string, end:string, location:string, modified:string, modifiedBy:object){
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
