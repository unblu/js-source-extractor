"use strict";
/*
 * js-source-extractor
 * Copyright(c) 2018 Kay Huber
 * ISC Licensed
 */
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
var fs_1 = require("fs");
var clear_module_1 = __importDefault(require("clear-module"));
chai.use(chai_as_promised_1.default);
var expect = chai.expect;
var baseDir = __dirname + "/../resources";
var outDir = os_1.tmpdir() + path_1.default.sep + 'js-source-extractor-test';
var embeddedSourcemapTestUrl = new url_1.URL(util_1.default.format('file://%s/embedded-sourcemap-test.js', baseDir));
var externalSourcemapTestUrl = new url_1.URL(util_1.default.format('file://%s/external-sourcemap-test.js', baseDir));
var cleanup = function (doResolve, arg, outDir) {
    return new Promise(function (resolve, reject) {
        console.info('cleaning up test directory ' + outDir);
        rimraf_1.default(outDir, function () {
            if (doResolve) {
                resolve(arg);
            }
            else {
                reject(arg);
            }
        });
    });
};
describe('Command Line Interface CLI', function () {
    beforeEach(function () {
        clear_module_1.default('commander');
    });
    it('Without resource url', function () {
        return expect(js_source_extractor_1.cli(['/usr/bin/node', __dirname + '/js-source-extractor'])).to.eventually.be.rejected;
    });
    it('With resource url from web', function () {
        var outDir = process.cwd() + path_1.default.sep + 'extract';
        return expect(js_source_extractor_1.cli(['/usr/bin/node', __dirname + '/js-source-extractor', 'https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js'])).to.eventually.be.fulfilled
            .then(function () {
            var outFileName = outDir + '/src/embedded-sourcemap-test.ts';
            expect(fs_1.existsSync(outFileName), 'extracted source file exists').to.be.true;
            expect(fs_1.readFileSync(outFileName).toString('utf-8'), 'source code').to.equal('console.log(\'Hello World!\');');
        }).then(function (result) { return cleanup(true, result, outDir); }, function (error) { return cleanup(false, error, outDir); });
    });
    it('Sourcemap embedded in Javascript file', function () {
        return expect(js_source_extractor_1.cli(['/usr/bin/node', __dirname + '/js-source-extractor', embeddedSourcemapTestUrl.toString(), '--outDir', outDir])).to.eventually.be.fulfilled
            .then(function () {
            var outFileName = outDir + '/src/embedded-sourcemap-test.ts';
            expect(fs_1.existsSync(outFileName), 'extracted source file exists').to.be.true;
            expect(fs_1.readFileSync(outFileName).toString('utf-8'), 'source code').to.equal('console.log(\'Hello World!\');');
        })
            .then(function (result) { return cleanup(true, result, outDir); }, function (error) { return cleanup(false, error, outDir); });
    });
    it('Sourcemap embedded in Javascript file with include/exclude filter', function () {
        return expect(js_source_extractor_1.cli(['/usr/bin/node', __dirname + '/js-source-extractor', embeddedSourcemapTestUrl.toString(), '--outDir', outDir, '--exclude', 'src'])).to.eventually.be.fulfilled
            .then(function () {
            var outFileName = outDir + '/src/embedded-sourcemap-test.ts';
            expect(fs_1.existsSync(outFileName), 'extracted source file exists').to.be.false;
        })
            .then(function (result) { return cleanup(true, result, outDir); }, function (error) { return cleanup(false, error, outDir); });
    });
});
describe('Module import', function () {
    describe('#Test extraction of test code under \'resources\' folder', function () {
        it('Sourcemap embedded in Javascript file', function () { return __awaiter(_this, void 0, void 0, function () {
            var sources;
            return __generator(this, function (_a) {
                sources = [];
                return [2 /*return*/, expect(js_source_extractor_1.extractSrc(embeddedSourcemapTestUrl, null, function (path, sourceName, source) {
                        sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                    })).to.eventually.be.fulfilled
                        .then(function () {
                        expect(sources.length, 'number of source files found').to.equal(1);
                        expect(sources[0].path, 'path of source file').to.equal('/src');
                        expect(sources[0].sourceName, 'name of source file').to.equal('/embedded-sourcemap-test.ts');
                        expect(sources[0].source, 'source code').to.equal('console.log(\'Hello World!\');');
                    })];
            });
        }); });
        it('Sourcemap in external map file', function () { return __awaiter(_this, void 0, void 0, function () {
            var sources;
            return __generator(this, function (_a) {
                sources = [];
                return [2 /*return*/, expect(js_source_extractor_1.extractSrc(externalSourcemapTestUrl, null, function (path, sourceName, source) {
                        sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                    })).to.eventually.be.fulfilled
                        .then(function () {
                        expect(sources.length, 'number of source files found').to.equal(1);
                        expect(sources[0].path, 'path of source file').to.equal('/src');
                        expect(sources[0].sourceName, 'name of source file').to.equal('/external-sourcemap-test.ts');
                        expect(sources[0].source, 'source code').to.equal('console.log(\'Hello World!\');');
                    })];
            });
        }); });
        it('Invalid Javascript file', function () { return __awaiter(_this, void 0, void 0, function () {
            var baseDir;
            return __generator(this, function (_a) {
                baseDir = __dirname + "/../resources";
                return [2 /*return*/, expect(js_source_extractor_1.extractSrc(new url_1.URL(util_1.default.format('file://%s/dummy.js', baseDir)), null, function (path, sourceName, source) {
                    })).to.eventually.be.rejected];
            });
        }); });
    });
    describe('#Test extraction of test code under \'resources\' folder to file system', function () {
        it('Sourcemap embedded in Javascript file', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, expect(js_source_extractor_1.extractSrcToDir(embeddedSourcemapTestUrl, null, outDir)).to.eventually.be.fulfilled
                        .then(function () {
                        var outFileName = outDir + '/src/embedded-sourcemap-test.ts';
                        expect(fs_1.existsSync(outFileName)).to.be.true;
                        expect(fs_1.readFileSync(outFileName).toString('utf-8')).to.equal('console.log(\'Hello World!\');');
                    })
                        .then(function (result) { return cleanup(true, result, outDir); }, function (error) { return cleanup(false, error, outDir); })];
            });
        }); });
    });
    describe('#Test extraction of in memory source map', function () {
        it('Plain hello world', function () { return __awaiter(_this, void 0, void 0, function () {
            var plainSourceMap, sources;
            return __generator(this, function (_a) {
                plainSourceMap = '{"version":3,"file":"external-sourcemap-test.js","sourceRoot":"","sources":["../src/external-sourcemap-test.ts"],"names":[],"mappings":";AAAA,OAAO,CAAC,GAAG,CAAC,cAAc,CAAC,CAAC","sourcesContent":["console.log(\'Hello World!\');"]}';
                sources = [];
                return [2 /*return*/, expect(js_source_extractor_1.extractSrc(null, plainSourceMap, function (path, sourceName, source) {
                        sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                    })).to.eventually.be.fulfilled
                        .then(function () {
                        expect(sources.length, 'number of source files found').to.equal(1);
                        expect(sources[0].path, 'path of source file').to.equal('/src');
                        expect(sources[0].sourceName, 'name of source file').to.equal('/external-sourcemap-test.ts');
                        expect(sources[0].source, 'source code').to.equal('console.log(\'Hello World!\');');
                    })];
            });
        }); });
    });
    describe('#Test extraction of public javascript lib', function () {
        it('jQuery', function () { return __awaiter(_this, void 0, void 0, function () {
            var sources;
            return __generator(this, function (_a) {
                sources = [];
                return [2 /*return*/, expect(js_source_extractor_1.extractSrc(new url_1.URL('https://code.jquery.com/jquery-3.3.1.min.map'), null, function (path, sourceName, source) {
                        sources.push({ 'path': path, 'sourceName': sourceName, 'source': source });
                    })).to.eventually.be.fulfilled
                        .then(function () {
                        expect(sources.length, 'number of source files found').to.equal(1);
                        expect(sources[0].path, 'path to source file').to.equal('');
                        expect(sources[0].sourceName, 'name of source file').to.equal('/jquery-3.3.1.js');
                        expect(sources[0].source, 'source code').is.null;
                    })];
            });
        }); });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtc291cmNlLWV4dHJhY3Rvci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsianMtc291cmNlLWV4dHJhY3Rvci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsaUJBMkpBOztBQTNKQSw2REFBdUU7QUFDdkUseUNBQTZCO0FBQzdCLDJCQUF3QjtBQUN4QixzRUFBOEM7QUFDOUMsOENBQXdCO0FBQ3hCLGtEQUE0QjtBQUM1Qix5QkFBMEI7QUFDMUIsOENBQXdCO0FBQ3hCLHlCQUE0QztBQUM1Qyw4REFBdUM7QUFFdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBYyxDQUFDLENBQUM7QUFDekIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQVEzQixJQUFNLE9BQU8sR0FBRyxTQUFTLEdBQUcsZUFBZSxDQUFDO0FBQzVDLElBQU0sTUFBTSxHQUFHLFdBQU0sRUFBRSxHQUFHLGNBQUksQ0FBQyxHQUFHLEdBQUcsMEJBQTBCLENBQUM7QUFDaEUsSUFBTSx3QkFBd0IsR0FBRyxJQUFJLFNBQUcsQ0FBQyxjQUFJLENBQUMsTUFBTSxDQUFDLHNDQUFzQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdkcsSUFBTSx3QkFBd0IsR0FBRyxJQUFJLFNBQUcsQ0FBQyxjQUFJLENBQUMsTUFBTSxDQUFDLHNDQUFzQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdkcsSUFBTSxPQUFPLEdBQUcsVUFBQyxTQUFrQixFQUFFLEdBQVEsRUFBRSxNQUFjO0lBQ3pELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELGdCQUFNLENBQUMsTUFBTSxFQUFFO1lBQ1gsSUFBSSxTQUFTLEVB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