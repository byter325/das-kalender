export class User{
    public uid:string
    public firstName:string
    public lastName:string
    public initials:string
    public mail:string
    public passwordHash:string
    public group:any[]
    public editableGroup:any[]
    public darkMode:boolean
    public isAdministrator:boolean

  constructor(
    uid: string, 
    firstName: string, 
    lastName: string, 
    initials: string, 
    mail: string, 
    passwordHash: string, 
    group: any[], 
    editableGroup: any[], 
    darkMode: boolean, 
    isAdministrator: boolean
) {
    this.uid = uid
    this.firstName = firstName
    this.lastName = lastName
    this.initials = initials
    this.mail = mail
    this.passwordHash = passwordHash
    this.group = group
    this.editableGroup = editableGroup
    this.darkMode = darkMode
    this.isAdministrator = isAdministrator
  }
    
}