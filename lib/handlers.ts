import * as path from "path";
import { Request, Response } from "express";
import { json2xml, xml2json } from "xml-js";
import * as ical from "node-ical";
import * as fs from "fs";
import * as tmp from "tmp";
import { Utils } from "./utils";
import * as https from "https";

export module Handlers {
    const SaxonJs = require("saxon-js");
    const dataDir: string = path.resolve(__dirname, "..", "data");
    const xsltDir: string = path.resolve(__dirname, "..", "transformations");
    const raplaUrl: string =
        "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";

    /**
     * HTTP handler for displaying events
     * GET params: from, to
     * @param {Request} req
     * @param {Response} res
     */
    export async function getRaplaEvents(req: Request, res: Response) {
        const course: string = req.params.course;
        const timeline: string | undefined = req.query.timeline?.toString();
        console.log(req.path);
        const fileName = `${dataDir}/${course}-kalender.xml`;
        if (!(await Utils.fileExists(fileName))) {
            res.status(500);
        } else {
            let from: string, to: string;
            if (typeof req.query.from != "undefined" && req.query.from) {
                from = req.query.from.toString();
            }
            if (typeof req.query.to != "undefined" && req.query.to) {
                to = req.query.to.toString();
            }
            let eventData = Utils.readFile(fileName);
            let jsdata = JSON.parse(
                xml2json(await eventData, { compact: true })
            );
            let eventResults = new Array();
            let elements: any[] = jsdata.events.event;
            elements.forEach((element) => {
                let add = true;
                if (
                    typeof from != "undefined" &&
                    from &&
                    element.start._text < from
                ) {
                    add = false;
                }
                if (typeof to != "undefined" && to && element.end._text > to) {
                    add = false;
                }
                if (add) {
                    eventResults.push(element);
                }
            });

            const tmpobj = tmp.fileSync();
            let awaitable = Utils.writeFile(tmpobj.fd.toString(), fileName);

            res.contentType("text/html");
            if (timeline) res.send(xmlEventsToHtmlTimelineView(tmpobj.name));
            else res.send(xmlEventsToHtmlGridView(tmpobj.name));

            await awaitable;
        }
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
        const icsUrl: string = raplaUrl
            .replace("@@page@@", "ical")
            .replace("@@lecturer@@", lecturer)
            .replace("@@course@@", course);
        fs.opendir(
            `${dataDir}`,
            (err: NodeJS.ErrnoException | null, dir: fs.Dir) => {
                if (err) {
                    // dir.close();
                    fs.mkdir(
                        `${dataDir}`,
                        (err: NodeJS.ErrnoException | null) => {
                            if (err) {
                                throw err;
                            }
                        }
                    );
                } else {
                    dir.close();
                }
            }
        );

        /**
         * download ics
         */
        https.get(icsUrl, (res: any) => {
            let caldata: string;
            res.setEncoding("utf8");
            res.on("data", (chunk: any) => {
                caldata += chunk;
            });
            res.on("end", () => {
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
                        fs.writeFileSync(
                            outkalfile,
                            xslTransform(outfile, "rapla2kalender.sef.json")
                        );
                    });
                } else {
                    console.log(
                        `No new data for course ${lecturer}/${course}...`
                    );
                }
            });
        });
    }

    /**
     *
     * @param outfile File with the old data
     * @param newData The new data
     * @returns Whether or not the cached data are equal
     */
    async function checkCache(
        outfile: string | fs.PathLike,
        newData: string
    ): Promise<boolean> {
        if (await Utils.fileExists(outfile)) {
            let oldData: Promise<string> = Utils.readFile(outfile);

            let oldDataHash = Utils.GenSHA256Hash(await oldData);
            let newDataHash = Utils.GenSHA256Hash(newData);
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
        return json2xml(JSON.stringify({ events: { event: jsObj } }), {
            compact: true,
        });
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
            destination: "serialized",
        }).principalResult;
    }

    /**
     * transforms xml event data to html grid view
     * @param {string} xmlFile
     * @returns {string} htmlString
     */
    export function xmlEventsToHtmlGridView(xmlFile: string) {
        return xslTransform(xmlFile, "b2f-events2grid.sef.json");
    }

    /**
     * transforms xml event data to html timeline view
     * @param {string} xmlFile
     * @returns {string} htmlString
     */
    export function xmlEventsToHtmlTimelineView(xmlFile: string) {
        return xslTransform(xmlFile, "b2f-events2timeline.sef.json");
    }
}
