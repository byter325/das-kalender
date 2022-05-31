"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Handlers = void 0;
var xml_js_1 = require("xml-js");
var ical_1 = require("ical");
var fs_1 = require("fs");
var Handlers;
(function (Handlers) {
    var pathUtils = require('path');
    // const fs = require('fs');
    // const https = require('https');
    // const convert = require('xml-js');
    // const ical = require('ical');
    var dataDir = pathUtils.resolve(__dirname, '..', 'data');
    var raplaUrl = "https://rapla.dhbw-karlsruhe.de/rapla?page=@@page@@&user=@@lecturer@@&file=@@course@@";
    var guidRegex = /[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/;
    function getRaplaEvents(req, res) {
        var course = req.params.course;
        console.log(req.path);
        var fileName = "".concat(dataDir, "/").concat(course, ".xml");
        // Maybe use fs/promise to read File async
        if (!(0, fs_1.existsSync)(fileName)) {
            res.status(500);
        }
        else {
            var from_1, to_1;
            if (typeof req.query.from != 'undefined' && req.query.from) {
                from_1 = req.query.from.toString();
            }
            if (typeof req.query.to != 'undefined' && req.query.to) {
                to_1 = req.query.to.toString();
            }
            var eventData = (0, fs_1.readFileSync)(fileName, "utf-8");
            var jsdata = JSON.parse((0, xml_js_1.xml2json)(eventData, { compact: true }));
            var eventResults_1 = new Array();
            var elements = jsdata.events.event;
            elements.forEach(function (element) {
                var add = true;
                if (typeof from_1 != 'undefined' && from_1 && element.start._text < from_1) {
                    add = false;
                }
                if (typeof to_1 != 'undefined' && to_1 && element.end._text > to_1) {
                    add = false;
                }
                if (add) {
                    eventResults_1.push(element);
                }
            });
            res.send(toXml(eventResults_1));
        }
    }
    Handlers.getRaplaEvents = getRaplaEvents;
    function fetchRaplaEvents(lecturer, course) {
        console.log("Fetching events from Rapla for ".concat(lecturer, "/").concat(course));
        var outfile = "".concat(dataDir, "/").concat(course, ".xml");
        var icsOutfile = "".concat(dataDir, "/").concat(course, ".ics");
        var icsUrl = raplaUrl.replace('@@page@@', 'ical').replace('@@lecturer@@', lecturer).replace('@@course@@', course);
        download(icsUrl, icsOutfile).then(function () {
            // Again try reading it with fs/promise in asnyc mode
            var caldata = (0, fs_1.readFileSync)(icsOutfile, "utf-8");
            var jsdata = (0, ical_1.parseICS)(caldata);
            var eventResults = new Array();
            for (var key in jsdata) {
                if (guidRegex.test(key)) {
                    eventResults.push(jsdata[key]);
                }
            }
            var xmldata = toXml(eventResults);
            (0, fs_1.writeFileSync)(outfile, xmldata);
        });
    }
    Handlers.fetchRaplaEvents = fetchRaplaEvents;
    function download(url, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function () { return __awaiter(_this, void 0, void 0, function () {
                        var res, data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetch(url)];
                                case 1:
                                    res = _a.sent();
                                    return [4 /*yield*/, res.text()];
                                case 2:
                                    data = _a.sent();
                                    (0, fs_1.writeFileSync)(filePath, data);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    }
    function toXml(jsObj) {
        return (0, xml_js_1.json2xml)(JSON.stringify({ "events": { "event": jsObj } }), { compact: true });
    }
})(Handlers = exports.Handlers || (exports.Handlers = {}));
