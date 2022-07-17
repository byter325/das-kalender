import * as path from "path";
import {json2xml} from "xml-js";
import * as ical from "node-ical";
import * as fs from "fs";
import {Utils} from "./utils";
import * as https from "https";
import e from "express";
import { XMLManager } from "./xml_manager";

export module Handlers {
    const SaxonJs = require("saxon-js");
    const dataDir: string = path.resolve(__dirname, '..', 'data');
    const xsltDir: string = path.resolve(__dirname, '..', 'transformations');
    const raplaUrl: string = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";

    // /**
    //  * HTTP handler for displaying events
    //  * GET params: from, to
    //  * @param {Request} req
    //  * @param {Response} res
    //  */
    // export function getRaplaEvents(req: Request, res: Response) {
    //     const course: string = req.params.course;
    //     const timeline: string | undefined = req.query.timeline?.toString();
    //     console.log(req.path);
    //     const fileName = `${dataDir}/${course}-kalender.xml`;
    //     if (!fs.existsSync(fileName)) {
    //         res.status(500);
    //     } else {
    //         let from: string, to: string;
    //         if (typeof req.query.from != 'undefined' && req.query.from) {
    //             from = req.query.from.toString();
    //         }
    //         if (typeof req.query.to != 'undefined' && req.query.to) {
    //             to = req.query.to.toString();
    //         }
    //         fs.readFile(fileName, "utf-8", (err, eventData) => {
    //             let jsdata = JSON.parse(xml2json(eventData, {compact: true}));
    //             let eventResults = new Array();
    //             let elements: any[] = jsdata.events.event;
    //             elements.forEach(element => {
    //                 let add = true;
    //                 if (typeof from != 'undefined' && from && element.start._text < from) {
    //                     add = false;
    //                 }
    //                 if (typeof to != 'undefined' && to && element.end._text > to) {
    //                     add = false;
    //                 }
    //                 if (add) {
    //                     eventResults.push(element);
    //                 }
    //             });
    //
    //             const tmpobj = tmp.fileSync();
    //             fs.writeFile(tmpobj.fd, eventsToXml(eventResults), () => {
    //                 res.contentType('text/html');
    //                 if (timeline) res.send(xmlEventsToHtmlTimelineView(tmpobj.name));
    //                 else res.send(xmlEventsToHtmlGridView(tmpobj.name));
    //             });
    //
    //         });
    //     }
    // }

    export function updateGroup(uid: string){
        console.log("Updating group " + uid);
        const eventsPath = path.join(XMLManager.PATH_DATA_EVENTS, Utils.GenerateHash(uid) + ".xml");
        const url = /<url>([A-z0-9\:\/\.\-\?\=\&\;]+)<\/url>/.exec(XMLManager.getGroup(uid))?.at(1);
        const urlRe = /((https:\/\/)*rapla\.dhbw-karlsruhe\.de\/rapla\?page=[A-z]+&user=[A-z]+&file=[A-z0-9]+)/;
        if(url != null){
            console.log("URL: " + url);
            console.log("URL Test: " + urlRe.test(url));
            const lecturer = /user=([A-z]+)/.exec(url);
            const course = /file=([A-z0-9]+)/.exec(url);
            console.log("Lecturer: " + lecturer?.[1]);
            console.log("Course: " + course?.[1]);
            if(lecturer != null && lecturer.length > 1 && course != null && course.length > 1){
                Handlers.updateRaplaEvents(lecturer[1], course[1]);
                let dataFilePath = path.join(XMLManager.PATH_DATA_DIR, course[1] + ".xml");
                console.log("Writing to " + dataFilePath);
                Utils.waitForFile(dataFilePath).then(() => {
                    fs.writeFileSync(eventsPath, fs.readFileSync(dataFilePath, {flag: "r"}), { flag: "w+" } );
                    console.log("Writing to " + eventsPath + " sucessfully");
                });
            }
        }
        else
            fs.writeFileSync(eventsPath, "<events></events>", { flag: "w+" })

        
    }

    export function updateAllGroups(){
        const uidRe = /<uid>([A-z0-9-\.\& \/]+)<\/uid>/g;
        let allGroups = XMLManager.getAllGroups();
        // console.log("Groups: " + allGroups);
        let result;
        do {
            result = uidRe.exec(allGroups);
            if(result != null && result.length > 1){
                let res = result.at(1);
                if(res)
                    updateGroup(res);
            }
        } while (result);
    }

    /**
     * Fetch events from RAPLA
     * @param {string} lecturer
     * @param {string} course
     */
    export function updateRaplaEvents(lecturer: string, course: string) {
        console.log(`Fetching events from Rapla for ${lecturer}/${course}`);
        const outfile: string = `${dataDir}/${course}.xml`;
        const outkalfile: string = `${dataDir}/${course}-kalender.xml`;
        const icsUrl: string = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);        
        fs.opendir(`${dataDir}`, (err: NodeJS.ErrnoException | null, dir: fs.Dir) => {
            if (err) {
                // dir.close();
                fs.mkdir(`${dataDir}`, (err: NodeJS.ErrnoException | null) => {
                    if (err) {
                        throw err;
                    }
                });
            } else {
                dir.close();
            }
        });

        /**
         * download ics
         */
        https.get(icsUrl, (res: any) => {
            let caldata: string;
            res.setEncoding('utf8');
            res.on('data', (chunk: any) => {
                caldata += chunk;
            });
            res.on('end', () => {
                /**
                 * parse ics
                 */
                let jsdata = ical.sync.parseICS(caldata);
                let eventResults = new Array();
                for (const key in jsdata) {
                    if (jsdata[key].type == "VEVENT") {
                        eventResults.push(jsdata[key]);
                    }
                }
                let xmldata: string = eventsToXml(eventResults);
                if (!checkCache(outfile, xmldata)) {
                    fs.writeFile(outfile, xmldata, () => {
                        /**
                         * transform events to xml
                         */
                        fs.writeFileSync(outkalfile, xslTransform(outfile, "rapla2kalender.sef.json"));
                    });
                } else {
                    console.log(`No new data for course ${lecturer}/${course}...`);
                }

            });
        });
        // fetch(icsUrl).then(async (response:globalThis.Response) => {
        // 	fs.writeFileSync(icsOutfile, await response.text());
        // });

        // let caldata: string = fs.readFileSync(icsOutfile, "utf-8");
        // let jsdata: FullCalendar = parseICS(caldata);
        // let eventResults: CalendarComponent[] = new Array();
        // for (const key in jsdata) {
        // 	if (guidRegex.test(key)) {
        // 		eventResults.push(jsdata[key]);
        // 	}
        // }
        // let xmldata: string = eventsToXml(eventResults);
        // fs.writeFileSync(outfile, xmldata)
    }

    /**
     *
     * @param outfile File with the old data
     * @param newData The new data
     * @returns Whether or not the cached data are equal
     */
    function checkCache(outfile: string | fs.PathLike, newData: string): boolean {
        if (fs.existsSync(outfile)) {
            let oldData: string = fs.readFileSync(outfile, null).toString();

            let oldDataHash = Utils.GenerateHash(oldData);
            let newDataHash = Utils.GenerateHash(newData);
            console.log(`${oldDataHash}==${newDataHash}`);
            return oldDataHash == newDataHash;
        } else {
            return false;
        }
    }

    /**
     * converts events from jsObj to xml
     * @param {*} jsObj
     * @returns {string} xmlString
     */
    export function eventsToXml(jsObj: Object): string {
        return json2xml(JSON.stringify({"events": {"event": jsObj}}), {compact: true})
    }

    /**
     * transforms xml with given xslt stylesheet
     * @param {string} xmlFile
     * @param {string} xsltFile
     * @returns {string} xmlString
     */
    function xslTransform(xmlFile: string, xsltFile: string) {
        return SaxonJs.transform({
            stylesheetFileName: `${xsltDir}/${xsltFile}`,
            sourceFileName: xmlFile,
            destination: "serialized"
        }).principalResult;
    }

    /**
     * transforms xml event data to html grid view
     * @param {string} xmlFile
     * @returns {string} htmlString
     */
    export function xmlEventsToHtmlGridView(xmlFile: string) {
        return xslTransform(xmlFile, "b2f-events2grid.sef.json")
    }

    /**
     * transforms xml event data to html timeline view
     * @param {string} xmlFile
     * @returns {string} htmlString
     */
    export function xmlEventsToHtmlTimelineView(xmlFile: string) {
        return xslTransform(xmlFile, "b2f-events2timeline.sef.json")
    }
}
