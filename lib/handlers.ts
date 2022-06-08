import { ParsedPath } from "path";
import { application, request, Request, response, Response } from "express";
import { json2xml, xml2json } from "xml-js";
import * as ical from "node-ical";
import * as fs from "fs";
import { Application, Express } from "express";
import * as CryptoJs from "crypto-js";
import * as tmp from "tmp";
import * as SaxonJs from "saxon-js";

const https = require('https');
const pathUtils = require('path');

export module Handlers {
	const dataDir: ParsedPath = pathUtils.resolve(__dirname, '..', 'data');
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
				let elements = jsdata.events.event;
				elements.forEach((element: { start: { _text: string; }; end: { _text: string; }; }) => {
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
					}, "async").then((outHtml: { principalResult: string; }) => {
						res.contentType('text/html');
						res.send(outHtml.principalResult);
					});
				});
			})
		}
	}

	export function fetchRaplaEvents(lecturer: string, course: string) {
		console.log(`Fetching events from Rapla for ${lecturer}/${course}`);
		const outfile: string = `${dataDir}/${course}.xml`;
		const outkalfile: string = `${dataDir}/${course}-kalender.xml`;
		const icsUrl: string = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);

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
		});
	}
	export function authenticate(req: Request, res: Response) {
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			res.status(401).setHeader("WWW-Authenticate", "Basic realm=\"Geschuetzter Bereich\", charset=\"UTF-8\"").send();
		} else {
			const creds64: string = req.headers.authorization.split(' ')[1];
			const credentials: string = CryptoJs.enc.Utf8.stringify(CryptoJs.enc.Base64.parse(creds64));
			const hash: string = CryptoJs.SHA256(credentials).toString();
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