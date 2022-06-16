import * as path from "path";
import { application, request, Request, response, Response } from "express";
import { json2xml, xml2json } from "xml-js";
import * as ical from "node-ical";
import * as fs from "fs";
<<<<<<< HEAD
import { Application, Express } from "express";
import * as CryptoJs from "crypto-js";
=======
import download from "download";
>>>>>>> origin/dev
import * as tmp from "tmp";
import { Utils } from "./utils"


<<<<<<< HEAD
const https = require('https');
const pathUtils = require('path');

export module Handlers {
	const dataDir: ParsedPath = pathUtils.resolve(__dirname, '..', 'data');
=======
export module Handlers {
	const SaxonJs = require("saxon-js");

	const dataDir: string = path.resolve(__dirname, '..', 'data');
>>>>>>> origin/dev
	const raplaUrl: string = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";
	const hashsFile: string = `${dataDir}/hashs.dat`;

	export function getRaplaEvents(req: Request, res: Response) {
		const course: string = req.params.course;
		console.log(req.path);
		const fileName = `${dataDir}/${course}-kalender.xml`;
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
<<<<<<< HEAD
				let elements = jsdata.events.event;
				elements.forEach((element: { start: { _text: string; }; end: { _text: string; }; }) => {
=======
				let elements:any[] = jsdata.events.event;
				elements.forEach(element => {
>>>>>>> origin/dev
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
						stylesheetFileName: "transformations/b2f-events.sef.json",
						sourceFileName: tmpobj.name,
						destination: "serialized"
<<<<<<< HEAD
					}, "async").then((outHtml: { principalResult: string; }) => {
						res.contentType('text/html');
						res.send(outHtml.principalResult);
					});
				});
			})
=======
					}, "async")
						.then((output:any) => {
							res.contentType('application/xml');
							res.send(output.principalResult);
						});
				})
			});
>>>>>>> origin/dev
		}
	}

	export function fetchRaplaEvents(lecturer: string, course: string) {
		console.log(`Fetching events from Rapla for ${lecturer}/${course}`);
		const outfile: string = `${dataDir}/${course}.xml`;
		const outkalfile: string = `${dataDir}/${course}-kalender.xml`;
		const icsUrl: string = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);
<<<<<<< HEAD

		https.get(icsUrl, (res: any) => {
			res.setEncoding('utf8');
			let caldata: any;
			res.on('data', (chunk: any) => {
				caldata += chunk;
			});
			res.on('end', () => {
				let jsdata = ical.sync.parseICS(caldata.toString());
				let eventResults = new Array();
				for (const key in jsdata) {
					if (jsdata[key].type == "VEVENT") {
						eventResults.push(jsdata[key]);
					}
				}
				let xmldata: string = toXml(eventResults);
				fs.writeFile(outfile, xmldata, () => {
					SaxonJs.transform({
						stylesheetFileName: "transformations/rapla2kalender.sef.json",
						sourceFileName: outfile,
						destination: "serialized"
					}, "async").then((output: { principalResult: string; }) => {
						fs.writeFileSync(outkalfile, output.principalResult);
					});
				});
			});
=======
		fetch(icsUrl).then(async (response:globalThis.Response) => {
			fs.writeFileSync(icsOutfile, await response.text());
>>>>>>> origin/dev
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