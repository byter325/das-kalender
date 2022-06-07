import * as path from "path";
import { application, request, Request, response, Response } from "express";
import { json2xml, xml2json } from "xml-js";
import { CalendarComponent, FullCalendar, parseICS } from "ical";
import * as fs from "fs";
import download from "download";
import * as tmp from "tmp";
import { Utils } from "./utils"


export module Handlers {
	const SaxonJs = require("saxon-js");

	const dataDir: string = path.resolve(__dirname, '..', 'data');
	const raplaUrl: string = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";
	const guidRegex: RegExp = /[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/;
	const hashsFile: string = `${dataDir}/hashs.dat`;

	export function getRaplaEvents(req: Request, res: Response) {
		const course: string = req.params.course;
		console.log(req.path);
		const fileName = `${dataDir}/${course}.xml`;
		// Maybe use fs/promise to read File async
		if (!fs.existsSync(fileName)) {
			res.status(500);
		} else {
			let from: string, to: string;
			if (typeof req.query.from != 'undefined' && req.query.from) {
				from = req.query.from.toString();
			}
			if (typeof req.query.to != 'undefined' && req.query.to) {
				to = req.query.to.toString();
			}
			fs.readFile(fileName, "utf-8", (err, eventData) => {
				let jsdata = JSON.parse(xml2json(eventData, { compact: true }));
				let eventResults = new Array();
				let elements:any[] = jsdata.events.event;
				elements.forEach(element => {
					let add = true;
					if (typeof from != 'undefined' && from && element.start._text < from) {
						add = false;
					}
					if (typeof to != 'undefined' && to && element.end._text > to) {
						add = false;
					}
					if (add) {
						eventResults.push(element);
					}
				});
				const tmpobj = tmp.fileSync();
				fs.writeFile(tmpobj.fd, toXml(eventResults), () => {
					SaxonJs.transform({
						stylesheetFileName: "transformations/rapla2kalender.sef.json",
						sourceFileName: tmpobj.name,
						destination: "serialized"
					}, "async")
						.then((output:any) => {
							res.contentType('application/xml');
							res.send(output.principalResult);
						});
				})
			});
		}

	}
	export function fetchRaplaEvents(lecturer: string, course: string) {
		console.log(`Fetching events from Rapla for ${lecturer}/${course}`);
		const outfile: string = `${dataDir}/${course}.xml`;
		const icsOutfile: string = `${dataDir}/${course}.ics`;
		const icsUrl: string = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);
		fetch(icsUrl).then(async (response:globalThis.Response) => {
			fs.writeFileSync(icsOutfile, await response.text());
		});

		let caldata: string = fs.readFileSync(icsOutfile, "utf-8");
		let jsdata: FullCalendar = parseICS(caldata);
		let eventResults: CalendarComponent[] = new Array();
		for (const key in jsdata) {
			if (guidRegex.test(key)) {
				eventResults.push(jsdata[key]);
			}
		}
		let xmldata: string = toXml(eventResults);
		fs.writeFileSync(outfile, xmldata)
	}

	export function authenticate(req: Request, res: Response) {
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			res.status(401).setHeader("WWW-Authenticate", "Basic realm=\"Geschuetzter Bereich\", charset=\"UTF-8\"").send();
		} else {
			const creds64: string = req.headers.authorization.split(' ')[1];
			const credentials: string = Utils.Word2Hex(Utils.Hex2Word(creds64)); 
			const hash: string = Utils.GenSHA256Hash(credentials);
			const hashs: string[] = fs.readFileSync(hashsFile, "utf-8").split("\n");
			if (!hashs.includes(hash)) {
				res.status(401).send("Forbidden");
				return false;
			}
			return true;
		}
	}

	function toXml(jsObj: Object): string {
		return json2xml(JSON.stringify({ "events": { "event": jsObj } }), { compact: true })
	}

}