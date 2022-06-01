import { ParsedPath } from "path";
import { application, request, Request, response, Response } from "express";
import { json2xml, xml2json } from "xml-js";
import { CalendarComponent, FullCalendar, parseICS } from "ical";
import { readFileSync, existsSync, writeFileSync, appendFile, fstat } from "fs";
import { Application, Express } from "express";
import * as CryptoJs from "crypto-js";
import download from "download";

export module Handlers {
	const pathUtils = require('path');
	// const fs = require('fs');
	// const https = require('https');
	// const convert = require('xml-js');
	// const ical = require('ical');

	const dataDir: ParsedPath = pathUtils.resolve(__dirname, '..', 'data');
	const raplaUrl: string = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";
	const guidRegex: RegExp = /[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/;
	const hashsFile: string = `${dataDir}/hashs.dat`;

	export function getRaplaEvents(req: Request, res: Response) {
		const course: string = req.params.course;
		console.log(req.path);
		const fileName = `${dataDir}/${course}.xml`;
		// Maybe use fs/promise to read File async
		if (!existsSync(fileName)) {
			res.status(500);
		} else {
			let from: string, to: string;
			if (typeof req.query.from != 'undefined' && req.query.from) {
				from = req.query.from.toString();
			}
			if (typeof req.query.to != 'undefined' && req.query.to) {
				to = req.query.to.toString();
			}
			let eventData = readFileSync(fileName, "utf-8");
			let jsdata = JSON.parse(xml2json(eventData, { compact: true }));
			let eventResults = new Array();
			let elements = jsdata.events.event;
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
			res.send(toXml(eventResults));
		}

	}
	export function fetchRaplaEvents(lecturer: string, course: string) {
		console.log(`Fetching events from Rapla for ${lecturer}/${course}`);
		const outfile: string = `${dataDir}/${course}.xml`;
		const icsOutfile: string = `${dataDir}/${course}.ics`;
		const icsUrl: string = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);
		download(icsUrl, icsOutfile).then(() => {
			// Again try reading it with fs/promise in asnyc mode
			let caldata: string = readFileSync(icsOutfile, "utf-8");
			let jsdata: FullCalendar = parseICS(caldata);
			let eventResults: CalendarComponent[] = new Array();
			for (const key in jsdata) {
				if (guidRegex.test(key)) {
					eventResults.push(jsdata[key]);
				}
			}
			let xmldata: string = toXml(eventResults);
			writeFileSync(outfile, xmldata)
		});
	}

	export function authenticate(req: Request, res: Response) {
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			res.status(401).setHeader("WWW-Authenticate", "Basic realm=\"Geschuetzter Bereich\", charset=\"UTF-8\"").send();
		} else {
			const creds64: string = req.headers.authorization.split(' ')[1];
			const credentials: string = CryptoJs.enc.Utf8.stringify(CryptoJs.enc.Base64.parse(creds64));
			const hash: string = CryptoJs.SHA256(credentials).toString();
			const hashs: string[] = readFileSync(hashsFile, "utf-8").split("\n");
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