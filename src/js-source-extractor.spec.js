"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var js_source_extractor_1 = require("./js-source-extractor");
var chai = __importStar(require("chai"));
var url_1 = require("url");
var chai_as_promised_1 = __importDefault(require("chai-as-promised"));
var util_1 = __importDefault(require("util"));
var rimraf_1 = __importDefault(require("rimraf"));
var os_1 = require("os");
var path_1 = __importDefault(require("path"));
chai.use(chai_as_promised_1.default);
var expect = chai.expect;
describe('Command Line Interface CLI', function () {
    describe('#Test extraction of test code under \'resources\' folder', function () {
        it('Sourcemap embedded in Javascript file', function () { return __awaiter(_this, void 0, void 0, function () {
            var baseDir, sources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseDir = __dirname + "/../resources";
                        sources = [];
                        return [4 /*yield*/, expect(js_source_extractor_1.extractSrc(new url_1.URL(util_1.default.format('file://%s/embedded-sourcemap-test.js', baseDir)), null, function (path, sourceName, source) {
                                sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                            })).to.eventually.be.fulfilled];
                    case 1:
                        _a.sent();
                        expect(sources.length).to.equal(1);
                        expect(sources[0].path).to.equal('/src');
                        expect(sources[0].sourceName).to.equal('/embedded-sourcemap-test.ts');
                        expect(sources[0].source).to.equal('console.log(\'Hello World!\');');
                        return [2 /*return*/];
                }
            });
        }); });
        it('Sourcemap in external map file', function () { return __awaiter(_this, void 0, void 0, function () {
            var baseDir, sources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseDir = __dirname + "/../resources";
                        sources = [];
                        return [4 /*yield*/, expect(js_source_extractor_1.extractSrc(new url_1.URL(util_1.default.format('file://%s/external-sourcemap-test.js', baseDir)), null, function (path, sourceName, source) {
                                sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                            })).to.eventually.be.fulfilled];
                    case 1:
                        _a.sent();
                        expect(sources.length).to.equal(1);
                        expect(sources[0].path).to.equal('/src');
                        expect(sources[0].sourceName).to.equal('/external-sourcemap-test.ts');
                        expect(sources[0].source).to.equal('console.log(\'Hello World!\');');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#Test extraction of test code under \'resources\' folder to file system', function () {
        it('Sourcemap embedded in Javascript file', function () { return __awaiter(_this, void 0, void 0, function () {
            var baseDir, outDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseDir = __dirname + "/../resources";
                        outDir = os_1.tmpdir() + path_1.default.sep + 'js-source-extractor-test';
                        return [4 /*yield*/, expect(js_source_extractor_1.extractSrcToDir(new url_1.URL(util_1.default.format('file://%s/embedded-sourcemap-test.js', baseDir)), outDir)).to.eventually.be.fulfilled];
                    case 1:
                        _a.sent();
                        // XXX TODO check in file system whether files are as expected
                        // remove test files
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                rimraf_1.default(outDir, function () {
                                    resolve();
                                });
                            })];
                }
            });
        }); });
    });
    describe('#Test extraction of in memory source map', function () {
        it('Plain hello world', function () { return __awaiter(_this, void 0, void 0, function () {
            var plainSourceMap, sources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plainSourceMap = '{"version":3,"file":"external-sourcemap-test.js","sourceRoot":"","sources":["../src/external-sourcemap-test.ts"],"names":[],"mappings":";AAAA,OAAO,CAAC,GAAG,CAAC,cAAc,CAAC,CAAC","sourcesContent":["console.log(\'Hello World!\');"]}';
                        sources = [];
                        return [4 /*yield*/, expect(js_source_extractor_1.extractSrc(null, plainSourceMap, function (path, sourceName, source) {
                                sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                            })).to.eventually.be.fulfilled];
                    case 1:
                        _a.sent();
                        expect(sources.length).to.equal(1);
                        expect(sources[0].path).to.equal('/src');
                        expect(sources[0].sourceName).to.equal('/external-sourcemap-test.ts');
                        expect(sources[0].source).to.equal('console.log(\'Hello World!\');');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#Test extraction of public javascript lib', function () {
        it('jQuery', function () { return __awaiter(_this, void 0, void 0, function () {
            var sources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = [];
                        return [4 /*yield*/, expect(js_source_extractor_1.extractSrc(new url_1.URL('https://code.jquery.com/jquery-3.3.1.min.map'), null, function (path, sourceName, source) {
                                sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                            })).to.eventually.be.fulfilled];
                    case 1:
                        _a.sent();
                        expect(sources.length).to.equal(1);
                        expect(sources[0].path).to.equal('');
                        expect(sources[0].sourceName).to.equal('/jquery-3.3.1.js');
                        expect(sources[0].source).is.null;
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtc291cmNlLWV4dHJhY3Rvci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsianMtc291cmNlLWV4dHJhY3Rvci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkE4RkE7O0FBOUZBLDZEQUFrRTtBQUNsRSx5Q0FBNkI7QUFDN0IsMkJBQXdCO0FBQ3hCLHNFQUE4QztBQUM5Qyw4Q0FBd0I7QUFDeEIsa0RBQTRCO0FBQzVCLHlCQUEwQjtBQUMxQiw4Q0FBd0I7QUFFeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBYyxDQUFDLENBQUM7QUFDekIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQVEzQixRQUFRLENBQUMsNEJBQTRCLEVBQUU7SUFDbkMsUUFBUSxDQUFDLDBEQUEwRCxFQUFFO1FBQ2pFLEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTs7Ozs7d0JBQ2xDLE9BQU8sR0FBRyxTQUFTLEdBQUcsZUFBZSxDQUFDO3dCQUN0QyxPQUFPLEdBQXlCLEVBQUUsQ0FBQzt3QkFDekMscUJBQU0sTUFBTSxDQUFDLGdDQUFVLENBQUMsSUFBSSxTQUFHLENBQUMsY0FBSSxDQUFDLE1BQU0sQ0FBQyxzQ0FBc0MsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFDLElBQVksRUFBRSxVQUFrQixFQUFFLE1BQXFCO2dDQUN6SixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDOzRCQUM3RSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBQTs7d0JBRjlCLFNBRThCLENBQUM7d0JBRS9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENB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