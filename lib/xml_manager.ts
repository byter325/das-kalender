import { readFileSync } from "fs"

const {XMLParser, XMLBuilder} = require('fast-xml-parser')

var data = readFileSync("./schemes/demoEvent.xml")
const parser = new XMLParser()
let jObj = parser.parse(data)
console.log(jObj['event']['uid'])