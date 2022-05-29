const pathUtils = require('path')
const fs = require('fs')
const https = require('https')
const convert = require('xml-js')
const ical = require('ical')

const dataDir = pathUtils.resolve(__dirname, '..', 'data')
const raplaUrl = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@"
const guidRegex = /[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/

exports.getRaplaEvents = (req, res) => {
	const course = req.params.course
	console.log(req.path)
	const fileName = `${dataDir}/${course}.xml`
	if (!fs.existsSync(fileName)) {
		res.status(500)
	} else {
		let from, to
		if (typeof req.query.from != 'undefined' && req.query.from) {
			from = req.query.from.toString()
		}
		if (typeof req.query.to != 'undefined' && req.query.to) {
			to = req.query.to.toString()
		}
		var eventData = fs.readFileSync(fileName, "utf-8")
		var jsdata = JSON.parse(convert.xml2json(eventData, { compact: true }))
		var eventResults = new Array()
		var elements = jsdata.events.event
		elements.forEach(element => {
			let add = true
			if (typeof from != 'undefined' && from && element.start._text < from) {
				add = false
			}
			if (typeof to != 'undefined' && to && element.end._text > to) {
				add = false
			}
			if (add) {
				eventResults.push(element)
			}
		})
		res.send(toXml(eventResults))
	}
}
exports.fetchRaplaEvents = (lecturer, course) => {
	console.log(`Fetching events from Rapla for ${lecturer}/${course}`)
	const outfile = `${dataDir}/${course}.xml`
	const icsOutfile = `${dataDir}/${course}.ics`
	const icsUrl = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course)
	download(icsUrl, icsOutfile).then(() => {
		var caldata = fs.readFileSync(icsOutfile, "utf-8")
		var jsdata = ical.parseICS(caldata)
		var eventResults = new Array()
		for (const key in jsdata) {
			if (guidRegex.test(key)) {
				eventResults.push(jsdata[key])
			}
		}
		var xmldata = toXml(eventResults)
		fs.writeFileSync(outfile, xmldata)
	})
}

async function download(url, filePath) {
	const proto = !url.charAt(4).localeCompare('s') ? https : http

	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filePath)
		let fileInfo = null

		const request = proto.get(url, response => {
			if (response.statusCode !== 200) {
				fs.unlink(filePath, () => {
					reject(new Error(`Failed to get '${url}' (${response.statusCode})`))
				})
				return
			}

			fileInfo = {
				mime: response.headers['content-type'],
				size: parseInt(response.headers['content-length'], 10),
			}

			response.pipe(file)
		})

		// The destination stream is ended by the time it's called
		file.on('finish', () => resolve(fileInfo))

		request.on('error', err => {
			fs.unlink(filePath, () => reject(err))
		})

		file.on('error', err => {
			fs.unlink(filePath, () => reject(err))
		})

		request.end()
	})
}

function toXml(jsObj) {
	return convert.json2xml(JSON.stringify({ "events": { "event": jsObj } }), { compact: true })
}