import * as path from "path";
import { application, request, Request, response, Response } from "express";
import { json2xml, xml2json } from "xml-js";
import * as ical from "node-ical";
import * as fs from "fs";
import { Application, Express } from "express";
import * as CryptoJs from "crypto-js";
import * as tmp from "tmp";
import { Utils } from "./utils";
import { XMLManager } from "./xml_manager";
import * as https from "https";
import { User } from "./classes/user";

export module Handlers {
	// const https = require('https');
	const SaxonJs = require("saxon-js");

	// TODO: Change folder structure to /events/
	const dataDir: string = path.resolve(__dirname, '..', 'data');
	const dataUsers: string = `${dataDir}/users`;
	const dataUserEvents: string = `${dataDir}/userEvents`;
	const dataGroups: string = `${dataDir}/groups`;
	const dataGroupEvents: string = `${dataDir}/groupEvents`;

	const xsltDir: string = path.resolve(__dirname, '..', 'transformations');
	const raplaUrl: string = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";

	/**
	 * HTTP handler for displaying events
	 * GET params: from, to
	 * @param {Request} req 
	 * @param {Response} res 
	 */
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
				let elements: any[] = jsdata.events.event;
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
				fs.writeFile(tmpobj.fd, eventsToXml(eventResults), () => {
					res.contentType('text/html');
					res.send(xmlEventsToHtmlGridView(tmpobj.name));
				});

			});
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
		const icsUrl: string = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);
		fs.opendir(`${dataDir}`, (err: NodeJS.ErrnoException | null, dir: fs.Dir) => {
			if (err) {
				// dir.close();
				fs.mkdir(`${dataDir}`, (err: NodeJS.ErrnoException | null) => {
					if (err) {
						throw err;
					}
				});
			}
			else {
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
				if (checkCache(outfile, xmldata) == false) {
					fs.writeFile(outfile, xmldata, () => {
						/**
						 * transform events to xml
						 */
						fs.writeFileSync(outkalfile, xslTransform(outfile, "rapla2kalender.sef.json"));
					});
				}
				else {
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
	 * Authenticate User based on req.headers.authorization
	 * @param req 
	 * @param res 
	 * @returns {boolean} True if authentication success, false otherwise
	 */
	export function authenticate(req: Request, res: Response) {
		/**
		 * check if authorization header is sent
		 * respond "401 www-authenticate" otherwise
		 */
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			res.status(401).setHeader("WWW-Authenticate", "Basic realm=\"Geschuetzter Bereich\", charset=\"UTF-8\"").send();
		} else {
			const creds64: string = req.headers.authorization.split(' ')[1];
			const credentials: string = Utils.Word2Hex(Utils.Hex2Word(creds64));
			/**
			 * public user for testing purposes only
			 */
			if (credentials == 'public:public') {
				return true;
			} else {
				/**
				 * get uid and pw from login request
				 */
				const uid = credentials.split(':')[0];
				const pwHash = Utils.GenSHA256Hash(credentials.split(':')[1]);
				var path = `${dataUsers}/${Utils.GenSHA256Hash(uid)}.xml`
				if (!fs.existsSync(path)) {
					return false;
				} else {
					var user: null | User = XMLManager.getUserByUid(uid);
					if (user && pwHash == user.passwordHash) {
						return true;
					} else {
						return false;
					}
				}
			}
		}
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

			let oldDataHash = Utils.GenSHA256Hash(oldData);
			let newDataHash = Utils.GenSHA256Hash(newData);
			console.log(`${oldDataHash}==${newDataHash}`);
			if (oldDataHash == newDataHash) {
				return true;
			}
			return false;
		}
		else {
			return false;
		}
	}

	/**
	 * converts events from jsObj to xml
	 * @param {*} jsObj 
	 * @returns {string} xmlString
	 */
	function eventsToXml(jsObj: Object): string {
		return json2xml(JSON.stringify({ "events": { "event": jsObj } }), { compact: true })
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
	 * transforms xml event data to html
	 * @param {string} xmlFile 
	 * @returns {string} htmlString
	 */
	function xmlEventsToHtmlGridView(xmlFile: string) {
		return xslTransform(xmlFile, "b2f-events.sef.json")
	}
}
