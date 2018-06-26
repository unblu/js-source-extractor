#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
var source_map_1 = require("source-map");
var httpsClient = __importStar(require("https"));
var httpClient = __importStar(require("http"));
var util = __importStar(require("util"));
var url_1 = require("url");
var fs_1 = require("fs");
var fs_2 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var url_2 = __importDefault(require("url"));
var mime_1 = __importDefault(require("mime"));
/* ********************** */
/* utilities              */
/* ********************** */
function mkdirPathSync(targetDir) {
    var sep = path_1.default.sep;
    var initDir = path_1.default.isAbsolute(targetDir) ? sep : '';
    var baseDir = '.';
    targetDir.split(sep).reduce(function (parentDir, childDir) {
        var curDir = path_1.default.resolve(baseDir, parentDir, childDir);
        try {
            fs_2.default.mkdirSync(curDir);
        }
        catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }
        return curDir;
    }, initDir);
}
function loadResource(resourceUrl) {
    console.info(util.format("Reading contents of %s", resourceUrl));
    return new Promise(function (resolve, reject) {
        var httpFn = function (res) {
            var responseBody = "";
            res.on("data", function (chunk) {
                responseBody += chunk;
            });
            res.on("end", function () {
                console.debug("source map response complete");
                resolve(responseBody);
            });
        };
        if (resourceUrl.protocol === 'https:') {
            httpsClient.request(resourceUrl, httpFn).end();
        }
        else if (resourceUrl.protocol === 'http:') {
            httpClient.request(resourceUrl, httpFn).end();
        }
        else if (resourceUrl.protocol === 'file:') {
            try {
                var result = fs_1.readFileSync(resourceUrl).toString('UTF-8');
                resolve(result);
            }
            catch (error) {
                console.error(util.format('Problem reading %s: %s', resourceUrl, error.message ? error.message : error));
                reject(error);
            }
        }
    });
}
function loadMap(resourceUrl, resourceType) {
    return __awaiter(this, void 0, void 0, function () {
        var guessedType, resourceContent, sourceMapPrefix, mapUrlIndex_1, mapUrl, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.info(util.format("Loading resource %s to examine (expecting javascript or source map)", resourceUrl));
                    if (!resourceType) {
                        guessedType = mime_1.default.getType(resourceUrl.pathname);
                        if (guessedType === 'application/javascript') {
                            resourceType = ResourceType.JAVASCRIPT;
                        }
                        else if (guessedType === 'application/json') {
                            resourceType = ResourceType.SOURCE_MAP;
                        }
                        else {
                            throw Error(util.format('No resource type specified and the guessed one \'%s\' is unrecognized.', guessedType));
                        }
                    }
                    console.info(util.format('Resource will be treated as a %s', resourceType.valueOf()));
                    return [4 /*yield*/, loadResource(resourceUrl)];
                case 1:
                    resourceContent = _a.sent();
                    if (!(resourceType === ResourceType.JAVASCRIPT)) return [3 /*break*/, 4];
                    sourceMapPrefix = ['//@ sourceMappingURL=', '//# sourceMappingURL='];
                    mapUrlIndex_1 = -1;
                    sourceMapPrefix.some(function (prefix) {
                        mapUrlIndex_1 = resourceContent.indexOf(prefix);
                        return mapUrlIndex_1 !== -1;
                    });
                    // locate //@ sourceMappingURL= and examine the string afterwards
                    if (mapUrlIndex_1 === -1) {
                        throw Error('No embedded source map url has been found. Is the source map in a separate file?');
                    }
                    console.info('Found source map url');
                    mapUrl = resourceContent.substring(mapUrlIndex_1 + '//@ sourceMappingURL='.length);
                    if (!mapUrl.startsWith('data:application/json;base64,')) return [3 /*break*/, 2];
                    console.info('Extracting embedded source map');
                    buf = Buffer.from(mapUrl.substring('data:application/json;base64,'.length), "base64");
                    resourceContent = buf.toString('UTF-8');
                    return [3 /*break*/, 4];
                case 2:
                    // load source map from url
                    console.info("Found source map url inside javascript file.");
                    return [4 /*yield*/, loadResource(new url_1.URL(mapUrl, resourceUrl))];
                case 3:
                    resourceContent = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, resourceContent];
            }
        });
    });
}
/* ********************** */
/* main exported functionalities */
/* ********************** */
/**
 * Type of resource. Required if not automatically determinable.
 */
var ResourceType;
(function (ResourceType) {
    ResourceType["JAVASCRIPT"] = "Javascript";
    ResourceType["SOURCE_MAP"] = "Source Map";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
/**
 * Extract source code from either a provided Javascript file containing a source map information, a Source Map file or a source map in string form.
 * Source code files must either be referenced and accessible via information in the source map or be contained in the source map (embedded).
 *
 * The extracted source code is stored in the file system. The directory structure that is provided with the source file path information in the source map will be created automatically.
 *
 * Example:
 * ```js
 * const baseDir = __dirname + "/../resources";
 * const outDir = tmpdir() + path.sep + 'js-source-extractor-test'; // directory to store source files in
 * await extractSrcToDir(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), outDir);
 * ```
 *
 * @param {module:url.URL | null} resourceUrl An url (http(s):// or file:// for local file access) to retrieve either a Javascript file or a Source Map file. If null, sourceMap must be specified.
 * @param {string | null} sourceMap Source Map JSON in string form to use directly. Must contain source code or refer with absolute urls to source files. If null, resourceUrl must be specified.
 * @param {string} outDir Directory where the source files should be stored into.
 * @param {ResourceType} resourceType Optional type describing whether the resourceUrl references a Javascript or a Source Map file. Automatic detection (according to the file name extensions) is attempted if not specified.
 * @param {RegExp} srcInclude Optional pattern to test a source code path against before sending it to the receiver. Defaults to .*
 * @param {RegExp} srcExclude Optional pattern to test a source code path against to exclude from sending it to the receiver. Exclude pattern is tested after the include pattern.
 * @returns {Promise<void>} Async function without a direct result (use receiver to receive information)
 */
function extractSrcToDir(resourceUrl, sourceMap, outDir, resourceType, srcInclude, srcExclude) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir;
        return __generator(this, function (_a) {
            baseDir = process.cwd() + path_1.default.sep + 'extract';
            if (typeof outDir !== 'undefined') {
                baseDir = outDir;
            }
            return [2 /*return*/, extractSrc(resourceUrl, null, function (path, sourceName, source) {
                    mkdirPathSync(baseDir + path);
                    try {
                        fs_2.default.writeFileSync(baseDir + path + sourceName, source);
                    }
                    catch (error) {
                        console.error(util.format("Problem while writing file %s: %s", baseDir + path + sourceName, error));
                    }
                    console.info(util.format("Source %s written", baseDir + path + sourceName));
                }, resourceType, srcInclude, srcExclude)];
        });
    });
}
exports.extractSrcToDir = extractSrcToDir;
/**
 * Extract source code from either a provided Javascript file containing a source map information, a Source Map file or a source map in string form.
 * Source code files must either be referenced and accessible via information in the source map or be contained in the source map (embedded).
 *
 * Example:
 * ```js
 * const baseDir = __dirname + "/../resources";
 * extractSrc(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
 *   console.log("Path: " + path);              // '/src'
 *   console.log("SourceName: " + sourceName);  // '/embedded-sourcemap-test.ts'
 *   console.log("Source: " + source);          // 'console.log(\'Hello World!\');'
 * });
 * ```
 *
 * Note: Either resourceUrl or sourceMap must be specified.
 *
 * @param {module:url.URL | null} resourceUrl An url (http(s):// or file:// for local file access) to retrieve either a Javascript file or a Source Map file. If null, sourceMap must be specified.
 * @param {string | null} sourceMap Source Map JSON in string form to use directly. Must contain source code or refer with absolute urls to source files. If null, resourceUrl must be specified.
 * @param {(path: string, sourceName: string, source: (string | null)) => void} receiver A callback function called for each source file referenced in the source map.
 *                                                                              Path is the base path of the source file, sourceName the file name, source the source code, if the file was found
 * @param {ResourceType} resourceType Optional type describing whether the resourceUrl references a Javascript or a Source Map file. Automatic detection (according to the file name extensions) is attempted if not specified.
 * @param {RegExp} srcInclude Optional pattern to test a source code path against before sending it to the receiver. Defaults to .*
 * @param {RegExp} srcExclude Optional pattern to test a source code path against to exclude from sending it to the receiver. Exclude pattern is tested after the include pattern.
 * @returns {Promise<void>} Async function without a direct result (use receiver to receive information)
 */
function extractSrc(resourceUrl, sourceMap, receiver, resourceType, srcInclude, srcExclude) {
    return __awaiter(this, void 0, void 0, function () {
        var rawMap, srcIncludeEff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rawMap = sourceMap;
                    if (!(rawMap === null)) return [3 /*break*/, 2];
                    if (resourceUrl === null) {
                        throw Error('No or invalid sourceMap and no or invalid resourceUrl provided');
                    }
                    return [4 /*yield*/, loadMap(resourceUrl)];
                case 1:
                    rawMap = _a.sent();
                    _a.label = 2;
                case 2:
                    if (typeof srcInclude !== 'undefined') {
                        srcIncludeEff = srcInclude;
                    }
                    else {
                        srcIncludeEff = /.*/;
                    }
                    return [4 /*yield*/, source_map_1.SourceMapConsumer.with(rawMap, null, function (consumer) {
                            console.info(util.format("Source map references %d source files", consumer.sources.length));
                            consumer.sources.forEach(function (sourceRef) {
                                if (!srcIncludeEff.test(sourceRef)) {
                                    console.log(util.format('Skipping %s: does not match include pattern'), sourceRef);
                                    return;
                                }
                                if (typeof srcExclude !== 'undefined' && srcExclude.test(sourceRef)) {
                                    console.log(util.format('Skipping %s: matched exclude pattern', sourceRef));
                                    return;
                                }
                                var sourceRefUrl = url_2.default.parse(sourceRef);
                                var pathName = sourceRefUrl.pathname + (sourceRefUrl.query ? sourceRefUrl.query : '') + (sourceRefUrl.hash ? sourceRefUrl.hash : '');
                                var fileName = pathName;
                                var source = consumer.sourceContentFor(sourceRef, true);
                                if (pathName.lastIndexOf(path_1.default.sep) != -1) {
                                    fileName = pathName.substring(pathName.lastIndexOf(path_1.default.sep));
                                    pathName = pathName.substring(0, pathName.lastIndexOf(path_1.default.sep));
                                    // drop any leading relative path constructs
                                    pathName = pathName.replace(/[\\]+/g, '/');
                                    pathName = path_1.default.sep + pathName.replace(/^[./]+/, '');
                                }
                                else {
                                    // for the sake of consistency with absolute path cases, we empty path and append a slash on fileName
                                    pathName = '';
                                    fileName = '/' + fileName;
                                }
                                receiver(pathName, fileName, source);
                            });
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.extractSrc = extractSrc;
/* ********************** */
/* exports                */
/* ********************** */
exports.ResourceType = ResourceType;
exports.extractSrcToDir = extractSrcToDir;
exports.extractSrc = extractSrc;
/**
 * Command line interface - wrapped in a function for better testability
 *
 * ```js
 * process.exit(cli(process.argv));
 * ```
 * @param {string[]} args command line arguments
 * @returns {number} non-zero numbers indicate an error
 */
function cli(args) {
    var packageJSON;
    try {
        var pkgPath = __dirname + "/../";
        var contents = fs_2.default.readFileSync(pkgPath + 'package.json').toString('utf-8');
        packageJSON = JSON.parse(contents);
    }
    catch (error) {
        // ignore for now - no version to specify in this case
    }
    var program = require('commander');
    if (packageJSON && packageJSON.version) {
        program.version(packageJSON.version, '-v, --version');
        program.description(packageJSON.description);
    }
    return new Promise(function (resolve, reject) {
        var resourceUrlPresent = false;
        program
            .arguments('<resourceUrl>')
            .option('-o, --outDir <outDir>', 'Base output directory where source files should be output to')
            .option('-i, --include <includePattern>', 'Include pattern to apply when selecting source files for extraction')
            .option('-e, --exclude <excludePattern>', 'Exclude pattern to apply when selecting source files for extraction (executed after include pattern)')
            .action(function (resourceUrl, options) {
            resourceUrlPresent = true;
            var realResourceUrl;
            try {
                realResourceUrl = new url_1.URL(resourceUrl);
            }
            catch (error) {
                reject(new Error("Invalid resourceUrl provided: " + error));
                return;
            }
            extractSrcToDir(realResourceUrl, null, options.outDir, undefined, options.include ? new RegExp(options.include) : undefined, options.exclude ? new RegExp(options.exclude) : undefined).then(function () { return resolve(0); });
        });
        program.parse(args);
        if (!resourceUrlPresent) {
            console.error('No resource url provided');
            program.outputHelp();
            reject(new Error('No resource url provided'));
            return;
        }
    });
}
exports.cli = cli;
// are we "required/imported" or called from command line?
if (require.main === module) {
    cli(process.argv)
        .then(function (result) {
        process.exit(result);
    })
        .catch(function (error) {
        process.exit(1);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtc291cmNlLWV4dHJhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qcy1zb3VyY2UtZXh0cmFjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFBLHlDQUE4QztBQUM5QyxpREFBcUM7QUFDckMsK0NBQW1DO0FBQ25DLHlDQUE2QjtBQUM3QiwyQkFBd0I7QUFFeEIseUJBQWdDO0FBQ2hDLDBDQUFvQjtBQUNwQiw4Q0FBd0I7QUFDeEIsNENBQXNCO0FBQ3RCLDhDQUF3QjtBQUV4Qiw0QkFBNEI7QUFDNUIsNEJBQTRCO0FBQzVCLDRCQUE0QjtBQUc1Qix1QkFBdUIsU0FBaUI7SUFDcEMsSUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixJQUFNLE9BQU8sR0FBRyxjQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN0RCxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFFcEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxTQUFTLEVBQUUsUUFBUTtRQUM1QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUQsSUFBSTtZQUNBLFlBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ3ZCLE1BQU0sR0FBRyxDQUFDO2FBQ2I7U0FDSjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQixDQUFDO0FBRUQsc0JBQXNC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REFBMEQ7QUFDMUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtJQUN6QixHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztTQUNaLElBQUksQ0FBQyxVQUFDLE1BQU07UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3hCLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxVQUFDLEtBQUs7UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0NBQ1YiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbi8qXG4gKiBqcy1zb3VyY2UtZXh0cmFjdG9yXG4gKiBDb3B5cmlnaHQoYykgMjAxOCBLYXkgSHViZXJcbiAqIElTQyBMaWNlbnNlZFxuICovXG5cbmltcG9ydCB7IFNvdXJjZU1hcENvbnN1bWVyfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCAqIGFzIGh0dHBzQ2xpZW50IGZyb20gJ2h0dHBzJztcbmltcG9ydCAqIGFzIGh0dHBDbGllbnQgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtVUkx9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tIFwiZnNcIjtcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCBtaW1lIGZyb20gJ21pbWUnO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqICovXG4vKiB1dGlsaXRpZXMgICAgICAgICAgICAgICovXG4vKiAqKioqKioqKioqKioqKioqKioqKioqICovXG5cblxuZnVuY3Rpb24gbWtkaXJQYXRoU3luYyh0YXJnZXREaXI6IHN0cmluZykge1xuICAgIGNvbnN0IHNlcCA9IHBhdGguc2VwO1xuICAgIGNvbnN0IGluaXREaXIgPSBwYXRoLmlzQWJzb2x1dGUodGFyZ2V0RGlyKSA/IHNlcCA6ICcnO1xuICAgIGNvbnN0IGJhc2VEaXIgPSAnLic7XG5cbiAgICB0YXJnZXREaXIuc3BsaXQoc2VwKS5yZWR1Y2UoKHBhcmVudERpciwgY2hpbGREaXIpID0+IHtcbiAgICAgICAgY29uc3QgY3VyRGlyID0gcGF0aC5yZXNvbHZlKGJhc2VEaXIsIHBhcmVudERpciwgY2hpbGREaXIpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGN1ckRpcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSAnRUVYSVNUJykge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJEaXI7XG4gICAgfSwgaW5pdERpcik7XG59XG5cbmZ1bmN0aW9uIGxvYWRSZXNvdXJjZShyZXNvdXJjZVVybDogVVJMKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJSZWFkaW5nIGNvbnRlbnRzIG9mICVzXCIsIHJlc291cmNlVXJsKSk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgaHR0cEZuID0gKHJlczogaHR0cC5JbmNvbWluZ01lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxldCByZXNwb25zZUJvZHkgPSBcIlwiO1xuICAgICAgICAgICAgcmVzLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgICAgICByZXNwb25zZUJvZHkgKz0gY2h1bms7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcy5vbihcImVuZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcInNvdXJjZSBtYXAgcmVzcG9uc2UgY29tcGxldGVcIik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZUJvZHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlc291cmNlVXJsLnByb3RvY29sID09PSAnaHR0cHM6Jykge1xuICAgICAgICAgICAgaHR0cHNDbGllbnQucmVxdWVzdChyZXNvdXJjZVVybCwgaHR0cEZuKS5lbmQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZVVybC5wcm90b2NvbCA9PT0gJ2h0dHA6Jykge1xuICAgICAgICAgICAgaHR0cENsaWVudC5yZXF1ZXN0KHJlc291cmNlVXJsLCBodHRwRm4pLmVuZCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlVXJsLnByb3RvY29sID09PSAnZmlsZTonKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlYWRGaWxlU3luYyhyZXNvdXJjZVVybCkudG9TdHJpbmcoJ1VURi04Jyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHV0aWwuZm9ybWF0KCdQcm9ibGVtIHJlYWRpbmcgJXM6ICVzJywgcmVzb3VyY2VVcmwsIGVycm9yLm1lc3NhZ2UgPyBlcnJvci5tZXNzYWdlIDogZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRNYXAocmVzb3VyY2VVcmw6IFVSTCwgcmVzb3VyY2VUeXBlPzogUmVzb3VyY2VUeXBlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJMb2FkaW5nIHJlc291cmNlICVzIHRvIGV4YW1pbmUgKGV4cGVjdGluZyBqYXZhc2NyaXB0IG9yIHNvdXJjZSBtYXApXCIsIHJlc291cmNlVXJsKSk7XG5cbiAgICBpZiAoIXJlc291cmNlVHlwZSkge1xuICAgICAgICBjb25zdCBndWVzc2VkVHlwZSA9IG1pbWUuZ2V0VHlwZShyZXNvdXJjZVVybC5wYXRobmFtZSk7XG4gICAgICAgIGlmIChndWVzc2VkVHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKSB7XG4gICAgICAgICAgICByZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGUuSkFWQVNDUklQVDtcbiAgICAgICAgfSBlbHNlIGlmIChndWVzc2VkVHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICAgICAgICByZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGUuU09VUkNFX01BUDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKHV0aWwuZm9ybWF0KCdObyByZXNvdXJjZSB0eXBlIHNwZWNpZmllZCBhbmQgdGhlIGd1ZXNzZWQgb25lIFxcJyVzXFwnIGlzIHVucmVjb2duaXplZC4nLCBndWVzc2VkVHlwZSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5pbmZvKHV0aWwuZm9ybWF0KCdSZXNvdXJjZSB3aWxsIGJlIHRyZWF0ZWQgYXMgYSAlcycsIHJlc291cmNlVHlwZS52YWx1ZU9mKCkpKTtcbiAgICBsZXQgcmVzb3VyY2VDb250ZW50ID0gYXdhaXQgbG9hZFJlc291cmNlKHJlc291cmNlVXJsKTtcblxuICAgIGlmIChyZXNvdXJjZVR5cGUgPT09IFJlc291cmNlVHlwZS5KQVZBU0NSSVBUKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZU1hcFByZWZpeCA9IFsnLy9AIHNvdXJjZU1hcHBpbmdVUkw9JywgJy8vIyBzb3VyY2VNYXBwaW5nVVJMPSddO1xuXG4gICAgICAgIGxldCBtYXBVcmxJbmRleCA9IC0xO1xuICAgICAgICBzb3VyY2VNYXBQcmVmaXguc29tZSgocHJlZml4KSA9PiB7XG4gICAgICAgICAgICBtYXBVcmxJbmRleCA9IHJlc291cmNlQ29udGVudC5pbmRleE9mKHByZWZpeCk7XG4gICAgICAgICAgICByZXR1cm4gbWFwVXJsSW5kZXggIT09IC0xO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBsb2NhdGUgLy9AIHNvdXJjZU1hcHBpbmdVUkw9IGFuZCBleGFtaW5lIHRoZSBzdHJpbmcgYWZ0ZXJ3YXJkc1xuICAgICAgICBpZiAobWFwVXJsSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignTm8gZW1iZWRkZWQgc291cmNlIG1hcCB1cmwgaGFzIGJlZW4gZm91bmQuIElzIHRoZSBzb3VyY2UgbWFwIGluIGEgc2VwYXJhdGUgZmlsZT8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUuaW5mbygnRm91bmQgc291cmNlIG1hcCB1cmwnKTtcblxuICAgICAgICBjb25zdCBtYXBVcmwgPSByZXNvdXJjZUNvbnRlbnQuc3Vic3RyaW5nKG1hcFVybEluZGV4ICsgJy8vQCBzb3VyY2VNYXBwaW5nVVJMPScubGVuZ3RoKTtcbiAgICAgICAgaWYgKG1hcFVybC5zdGFydHNXaXRoKCdkYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCcpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ0V4dHJhY3RpbmcgZW1iZWRkZWQgc291cmNlIG1hcCcpO1xuXG4gICAgICAgICAgICAvLyBtYXAgdXJsIGlzIG5vdCBhIG1hcCB1cmwgYnV0IGRpcmVjdGx5IHRoZSBtYXAgY29udGVudHNcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5mcm9tKG1hcFVybC5zdWJzdHJpbmcoJ2RhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsJy5sZW5ndGgpLCBcImJhc2U2NFwiKTtcbiAgICAgICAgICAgIHJlc291cmNlQ29udGVudCA9IGJ1Zi50b1N0cmluZygnVVRGLTgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGxvYWQgc291cmNlIG1hcCBmcm9tIHVybFxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiRm91bmQgc291cmNlIG1hcCB1cmwgaW5zaWRlIGphdmFzY3JpcHQgZmlsZS5cIik7XG4gICAgICAgICAgICByZXNvdXJjZUNvbnRlbnQgPSBhd2FpdCBsb2FkUmVzb3VyY2UobmV3IFVSTChtYXBVcmwsIHJlc291cmNlVXJsKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb3VyY2VDb250ZW50O1xufVxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqICovXG4vKiBtYWluIGV4cG9ydGVkIGZ1bmN0aW9uYWxpdGllcyAqL1xuLyogKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKipcbiAqIFR5cGUgb2YgcmVzb3VyY2UuIFJlcXVpcmVkIGlmIG5vdCBhdXRvbWF0aWNhbGx5IGRldGVybWluYWJsZS5cbiAqL1xuZXhwb3J0IGVudW0gUmVzb3VyY2VUeXBlIHtcbiAgICBKQVZBU0NSSVBUID0gJ0phdmFzY3JpcHQnLFxuICAgIFNPVVJDRV9NQVAgPSAnU291cmNlIE1hcCdcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHNvdXJjZSBjb2RlIGZyb20gZWl0aGVyIGEgcHJvdmlkZWQgSmF2YXNjcmlwdCBmaWxlIGNvbnRhaW5pbmcgYSBzb3VyY2UgbWFwIGluZm9ybWF0aW9uLCBhIFNvdXJjZSBNYXAgZmlsZSBvciBhIHNvdXJjZSBtYXAgaW4gc3RyaW5nIGZvcm0uXG4gKiBTb3VyY2UgY29kZSBmaWxlcyBtdXN0IGVpdGhlciBiZSByZWZlcmVuY2VkIGFuZCBhY2Nlc3NpYmxlIHZpYSBpbmZvcm1hdGlvbiBpbiB0aGUgc291cmNlIG1hcCBvciBiZSBjb250YWluZWQgaW4gdGhlIHNvdXJjZSBtYXAgKGVtYmVkZGVkKS5cbiAqXG4gKiBUaGUgZXh0cmFjdGVkIHNvdXJjZSBjb2RlIGlzIHN0b3JlZCBpbiB0aGUgZmlsZSBzeXN0ZW0uIFRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIHRoYXQgaXMgcHJvdmlkZWQgd2l0aCB0aGUgc291cmNlIGZpbGUgcGF0aCBpbmZvcm1hdGlvbiBpbiB0aGUgc291cmNlIG1hcCB3aWxsIGJlIGNyZWF0ZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBganNcbiAqIGNvbnN0IGJhc2VEaXIgPSBfX2Rpcm5hbWUgKyBcIi8uLi9yZXNvdXJjZXNcIjtcbiAqIGNvbnN0IG91dERpciA9IHRtcGRpcigpICsgcGF0aC5zZXAgKyAnanMtc291cmNlLWV4dHJhY3Rvci10ZXN0JzsgLy8gZGlyZWN0b3J5IHRvIHN0b3JlIHNvdXJjZSBmaWxlcyBpblxuICogYXdhaXQgZXh0cmFjdFNyY1RvRGlyKG5ldyBVUkwodXRpbC5mb3JtYXQoJ2ZpbGU6Ly8lcy9lbWJlZGRlZC1zb3VyY2VtYXAtdGVzdC5qcycsIGJhc2VEaXIpKSwgb3V0RGlyKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkwgfCBudWxsfSByZXNvdXJjZVVybCBBbiB1cmwgKGh0dHAocyk6Ly8gb3IgZmlsZTovLyBmb3IgbG9jYWwgZmlsZSBhY2Nlc3MpIHRvIHJldHJpZXZlIGVpdGhlciBhIEphdmFzY3JpcHQgZmlsZSBvciBhIFNvdXJjZSBNYXAgZmlsZS4gSWYgbnVsbCwgc291cmNlTWFwIG11c3QgYmUgc3BlY2lmaWVkLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsfSBzb3VyY2VNYXAgU291cmNlIE1hcCBKU09OIGluIHN0cmluZyBmb3JtIHRvIHVzZSBkaXJlY3RseS4gTXVzdCBjb250YWluIHNvdXJjZSBjb2RlIG9yIHJlZmVyIHdpdGggYWJzb2x1dGUgdXJscyB0byBzb3VyY2UgZmlsZXMuIElmIG51bGwsIHJlc291cmNlVXJsIG11c3QgYmUgc3BlY2lmaWVkLlxuICogQHBhcmFtIHtzdHJpbmd9IG91dERpciBEaXJlY3Rvcnkgd2hlcmUgdGhlIHNvdXJjZSBmaWxlcyBzaG91bGQgYmUgc3RvcmVkIGludG8uXG4gKiBAcGFyYW0ge1Jlc291cmNlVHlwZX0gcmVzb3VyY2VUeXBlIE9wdGlvbmFsIHR5cGUgZGVzY3JpYmluZyB3aGV0aGVyIHRoZSByZXNvdXJjZVVybCByZWZlcmVuY2VzIGEgSmF2YXNjcmlwdCBvciBhIFNvdXJjZSBNYXAgZmlsZS4gQXV0b21hdGljIGRldGVjdGlvbiAoYWNjb3JkaW5nIHRvIHRoZSBmaWxlIG5hbWUgZXh0ZW5zaW9ucykgaXMgYXR0ZW1wdGVkIGlmIG5vdCBzcGVjaWZpZWQuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gc3JjSW5jbHVkZSBPcHRpb25hbCBwYXR0ZXJuIHRvIHRlc3QgYSBzb3VyY2UgY29kZSBwYXRoIGFnYWluc3QgYmVmb3JlIHNlbmRpbmcgaXQgdG8gdGhlIHJlY2VpdmVyLiBEZWZhdWx0cyB0byAuKlxuICogQHBhcmFtIHtSZWdFeHB9IHNyY0V4Y2x1ZGUgT3B0aW9uYWwgcGF0dGVybiB0byB0ZXN0IGEgc291cmNlIGNvZGUgcGF0aCBhZ2FpbnN0IHRvIGV4Y2x1ZGUgZnJvbSBzZW5kaW5nIGl0IHRvIHRoZSByZWNlaXZlci4gRXhjbHVkZSBwYXR0ZXJuIGlzIHRlc3RlZCBhZnRlciB0aGUgaW5jbHVkZSBwYXR0ZXJuLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEFzeW5jIGZ1bmN0aW9uIHdpdGhvdXQgYSBkaXJlY3QgcmVzdWx0ICh1c2UgcmVjZWl2ZXIgdG8gcmVjZWl2ZSBpbmZvcm1hdGlvbilcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RTcmNUb0RpcihyZXNvdXJjZVVybDogVVJMIHwgbnVsbCwgc291cmNlTWFwOiBzdHJpbmcgfCBudWxsLCBvdXREaXI/OiBzdHJpbmcsIHJlc291cmNlVHlwZT86IFJlc291cmNlVHlwZSwgc3JjSW5jbHVkZT86IFJlZ0V4cCwgc3JjRXhjbHVkZT86IFJlZ0V4cCkge1xuICAgIGxldCBiYXNlRGlyOiBzdHJpbmcgPSBwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnZXh0cmFjdCc7XG4gICAgaWYgKHR5cGVvZiBvdXREaXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGJhc2VEaXIgPSBvdXREaXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dHJhY3RTcmMocmVzb3VyY2VVcmwsIG51bGwsKHBhdGgsIHNvdXJjZU5hbWUsIHNvdXJjZSkgPT4ge1xuICAgICAgICBta2RpclBhdGhTeW5jKGJhc2VEaXIgKyBwYXRoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhiYXNlRGlyICsgcGF0aCArIHNvdXJjZU5hbWUsIHNvdXJjZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHV0aWwuZm9ybWF0KFwiUHJvYmxlbSB3aGlsZSB3cml0aW5nIGZpbGUgJXM6ICVzXCIsIGJhc2VEaXIgKyBwYXRoICsgc291cmNlTmFtZSwgZXJyb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUuaW5mbyh1dGlsLmZvcm1hdChcIlNvdXJjZSAlcyB3cml0dGVuXCIsIGJhc2VEaXIgKyBwYXRoICsgc291cmNlTmFtZSkpO1xuICAgIH0sIHJlc291cmNlVHlwZSwgc3JjSW5jbHVkZSwgc3JjRXhjbHVkZSk7XG59XG5cbi8qKlxuICogRXh0cmFjdCBzb3VyY2UgY29kZSBmcm9tIGVpdGhlciBhIHByb3ZpZGVkIEphdmFzY3JpcHQgZmlsZSBjb250YWluaW5nIGEgc291cmNlIG1hcCBpbmZvcm1hdGlvbiwgYSBTb3VyY2UgTWFwIGZpbGUgb3IgYSBzb3VyY2UgbWFwIGluIHN0cmluZyBmb3JtLlxuICogU291cmNlIGNvZGUgZmlsZXMgbXVzdCBlaXRoZXIgYmUgcmVmZXJlbmNlZCBhbmQgYWNjZXNzaWJsZSB2aWEgaW5mb3JtYXRpb24gaW4gdGhlIHNvdXJjZSBtYXAgb3IgYmUgY29udGFpbmVkIGluIHRoZSBzb3VyY2UgbWFwIChlbWJlZGRlZCkuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYGpzXG4gKiBjb25zdCBiYXNlRGlyID0gX19kaXJuYW1lICsgXCIvLi4vcmVzb3VyY2VzXCI7XG4gKiBleHRyYWN0U3JjKG5ldyBVUkwodXRpbC5mb3JtYXQoJ2ZpbGU6Ly8lcy9lbWJlZGRlZC1zb3VyY2VtYXAtdGVzdC5qcycsIGJhc2VEaXIpKSwgbnVsbCwgKHBhdGg6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyB8IG51bGwpID0+IHtcbiAqICAgY29uc29sZS5sb2coXCJQYXRoOiBcIiArIHBhdGgpOyAgICAgICAgICAgICAgLy8gJy9zcmMnXG4gKiAgIGNvbnNvbGUubG9nKFwiU291cmNlTmFtZTogXCIgKyBzb3VyY2VOYW1lKTsgIC8vICcvZW1iZWRkZWQtc291cmNlbWFwLXRlc3QudHMnXG4gKiAgIGNvbnNvbGUubG9nKFwiU291cmNlOiBcIiArIHNvdXJjZSk7ICAgICAgICAgIC8vICdjb25zb2xlLmxvZyhcXCdIZWxsbyBXb3JsZCFcXCcpOydcbiAqIH0pO1xuICogYGBgXG4gKlxuICogTm90ZTogRWl0aGVyIHJlc291cmNlVXJsIG9yIHNvdXJjZU1hcCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqXG4gKiBAcGFyYW0ge21vZHVsZTp1cmwuVVJMIHwgbnVsbH0gcmVzb3VyY2VVcmwgQW4gdXJsIChodHRwKHMpOi8vIG9yIGZpbGU6Ly8gZm9yIGxvY2FsIGZpbGUgYWNjZXNzKSB0byByZXRyaWV2ZSBlaXRoZXIgYSBKYXZhc2NyaXB0IGZpbGUgb3IgYSBTb3VyY2UgTWFwIGZpbGUuIElmIG51bGwsIHNvdXJjZU1hcCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVsbH0gc291cmNlTWFwIFNvdXJjZSBNYXAgSlNPTiBpbiBzdHJpbmcgZm9ybSB0byB1c2UgZGlyZWN0bHkuIE11c3QgY29udGFpbiBzb3VyY2UgY29kZSBvciByZWZlciB3aXRoIGFic29sdXRlIHVybHMgdG8gc291cmNlIGZpbGVzLiBJZiBudWxsLCByZXNvdXJjZVVybCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7KHBhdGg6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IChzdHJpbmcgfCBudWxsKSkgPT4gdm9pZH0gcmVjZWl2ZXIgQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgZm9yIGVhY2ggc291cmNlIGZpbGUgcmVmZXJlbmNlZCBpbiB0aGUgc291cmNlIG1hcC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUGF0aCBpcyB0aGUgYmFzZSBwYXRoIG9mIHRoZSBzb3VyY2UgZmlsZSwgc291cmNlTmFtZSB0aGUgZmlsZSBuYW1lLCBzb3VyY2UgdGhlIHNvdXJjZSBjb2RlLCBpZiB0aGUgZmlsZSB3YXMgZm91bmRcbiAqIEBwYXJhbSB7UmVzb3VyY2VUeXBlfSByZXNvdXJjZVR5cGUgT3B0aW9uYWwgdHlwZSBkZXNjcmliaW5nIHdoZXRoZXIgdGhlIHJlc291cmNlVXJsIHJlZmVyZW5jZXMgYSBKYXZhc2NyaXB0IG9yIGEgU291cmNlIE1hcCBmaWxlLiBBdXRvbWF0aWMgZGV0ZWN0aW9uIChhY2NvcmRpbmcgdG8gdGhlIGZpbGUgbmFtZSBleHRlbnNpb25zKSBpcyBhdHRlbXB0ZWQgaWYgbm90IHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBzcmNJbmNsdWRlIE9wdGlvbmFsIHBhdHRlcm4gdG8gdGVzdCBhIHNvdXJjZSBjb2RlIHBhdGggYWdhaW5zdCBiZWZvcmUgc2VuZGluZyBpdCB0byB0aGUgcmVjZWl2ZXIuIERlZmF1bHRzIHRvIC4qXG4gKiBAcGFyYW0ge1JlZ0V4cH0gc3JjRXhjbHVkZSBPcHRpb25hbCBwYXR0ZXJuIHRvIHRlc3QgYSBzb3VyY2UgY29kZSBwYXRoIGFnYWluc3QgdG8gZXhjbHVkZSBmcm9tIHNlbmRpbmcgaXQgdG8gdGhlIHJlY2VpdmVyLiBFeGNsdWRlIHBhdHRlcm4gaXMgdGVzdGVkIGFmdGVyIHRoZSBpbmNsdWRlIHBhdHRlcm4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gQXN5bmMgZnVuY3Rpb24gd2l0aG91dCBhIGRpcmVjdCByZXN1bHQgKHVzZSByZWNlaXZlciB0byByZWNlaXZlIGluZm9ybWF0aW9uKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFNyYyhyZXNvdXJjZVVybDogVVJMIHwgbnVsbCwgc291cmNlTWFwOiBzdHJpbmcgfCBudWxsLCByZWNlaXZlcjogKHBhdGg6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyB8IG51bGwpID0+IHZvaWQsIHJlc291cmNlVHlwZT86IFJlc291cmNlVHlwZSwgc3JjSW5jbHVkZT86IFJlZ0V4cCwgc3JjRXhjbHVkZT86IFJlZ0V4cCkge1xuICAgIGxldCByYXdNYXAgPSBzb3VyY2VNYXA7XG4gICAgaWYgKHJhd01hcCA9PT0gbnVsbCkge1xuICAgICAgICBpZiAocmVzb3VyY2VVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdObyBvciBpbnZhbGlkIHNvdXJjZU1hcCBhbmQgbm8gb3IgaW52YWxpZCByZXNvdXJjZVVybCBwcm92aWRlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmF3TWFwID0gYXdhaXQgbG9hZE1hcChyZXNvdXJjZVVybCk7XG4gICAgfVxuXG4gICAgbGV0IHNyY0luY2x1ZGVFZmY6IFJlZ0V4cDtcbiAgICBpZiAodHlwZW9mIHNyY0luY2x1ZGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHNyY0luY2x1ZGVFZmYgPSBzcmNJbmNsdWRlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNyY0luY2x1ZGVFZmYgPSAvLiovO1xuICAgIH1cblxuXG4gICAgYXdhaXQgU291cmNlTWFwQ29uc3VtZXIud2l0aChyYXdNYXAsIG51bGwsIChjb25zdW1lcikgPT4ge1xuICAgICAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJTb3VyY2UgbWFwIHJlZmVyZW5jZXMgJWQgc291cmNlIGZpbGVzXCIsIGNvbnN1bWVyLnNvdXJjZXMubGVuZ3RoKSk7XG5cbiAgICAgICAgY29uc3VtZXIuc291cmNlcy5mb3JFYWNoKChzb3VyY2VSZWYpID0+IHtcbiAgICAgICAgICAgIGlmICghc3JjSW5jbHVkZUVmZi50ZXN0KHNvdXJjZVJlZikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1dGlsLmZvcm1hdCgnU2tpcHBpbmcgJXM6IGRvZXMgbm90IG1hdGNoIGluY2x1ZGUgcGF0dGVybicpLCBzb3VyY2VSZWYpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzcmNFeGNsdWRlICE9PSAndW5kZWZpbmVkJyAmJiBzcmNFeGNsdWRlLnRlc3Qoc291cmNlUmVmKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHV0aWwuZm9ybWF0KCdTa2lwcGluZyAlczogbWF0Y2hlZCBleGNsdWRlIHBhdHRlcm4nLCBzb3VyY2VSZWYpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZVJlZlVybCA9IHVybC5wYXJzZShzb3VyY2VSZWYpO1xuICAgICAgICAgICAgbGV0IHBhdGhOYW1lID0gc291cmNlUmVmVXJsLnBhdGhuYW1lICsgKHNvdXJjZVJlZlVybC5xdWVyeSA/IHNvdXJjZVJlZlVybC5xdWVyeSA6ICcnKSArIChzb3VyY2VSZWZVcmwuaGFzaCA/IHNvdXJjZVJlZlVybC5oYXNoIDogJycpO1xuICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gcGF0aE5hbWU7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBjb25zdW1lci5zb3VyY2VDb250ZW50Rm9yKHNvdXJjZVJlZiwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAocGF0aE5hbWUubGFzdEluZGV4T2YocGF0aC5zZXApICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBwYXRoTmFtZS5zdWJzdHJpbmcocGF0aE5hbWUubGFzdEluZGV4T2YocGF0aC5zZXApKTtcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGhOYW1lLnN1YnN0cmluZygwLCBwYXRoTmFtZS5sYXN0SW5kZXhPZihwYXRoLnNlcCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gZHJvcCBhbnkgbGVhZGluZyByZWxhdGl2ZSBwYXRoIGNvbnN0cnVjdHNcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGhOYW1lLnJlcGxhY2UoL1tcXFxcXSsvZywgJy8nKTtcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGguc2VwICsgcGF0aE5hbWUucmVwbGFjZSgvXlsuL10rLywgJycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIHNha2Ugb2YgY29uc2lzdGVuY3kgd2l0aCBhYnNvbHV0ZSBwYXRoIGNhc2VzLCB3ZSBlbXB0eSBwYXRoIGFuZCBhcHBlbmQgYSBzbGFzaCBvbiBmaWxlTmFtZVxuICAgICAgICAgICAgICAgIHBhdGhOYW1lID0gJyc7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWUgPSAnLycgKyBmaWxlTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVjZWl2ZXIocGF0aE5hbWUsIGZpbGVOYW1lLCBzb3VyY2UpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLyogKioqKioqKioqKioqKioqKioqKioqKiAqL1xuLyogZXhwb3J0cyAgICAgICAgICAgICAgICAqL1xuLyogKioqKioqKioqKioqKioqKioqKioqKiAqL1xuZXhwb3J0cy5SZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGU7XG5leHBvcnRzLmV4dHJhY3RTcmNUb0RpciA9IGV4dHJhY3RTcmNUb0RpcjtcbmV4cG9ydHMuZXh0cmFjdFNyYyA9IGV4dHJhY3RTcmM7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKiogKi9cbi8qIGNvbW1hbmQgbGluZSAgICAgICAgICAgKi9cbi8qICoqKioqKioqKioqKioqKioqKioqKiogKi9cblxuaW50ZXJmYWNlIE9wdGlvbnMge1xuICAgIG91dERpcjogc3RyaW5nO1xuICAgIGluY2x1ZGU/OiBzdHJpbmc7XG4gICAgZXhjbHVkZT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDb21tYW5kIGxpbmUgaW50ZXJmYWNlIC0gd3JhcHBlZCBpbiBhIGZ1bmN0aW9uIGZvciBiZXR0ZXIgdGVzdGFiaWxpdHlcbiAqXG4gKiBgYGBqc1xuICogcHJvY2Vzcy5leGl0KGNsaShwcm9jZXNzLmFyZ3YpKTtcbiAqIGBgYFxuICogQHBhcmFtIHtzdHJpbmdbXX0gYXJncyBjb21tYW5kIGxpbmUgYXJndW1lbnRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBub24temVybyBudW1iZXJzIGluZGljYXRlIGFuIGVycm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGkoYXJnczogc3RyaW5nW10pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBwYWNrYWdlSlNPTjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwa2dQYXRoID0gX19kaXJuYW1lICsgXCIvLi4vXCI7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKHBrZ1BhdGggKyAncGFja2FnZS5qc29uJykudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgICAgIHBhY2thZ2VKU09OID0gSlNPTi5wYXJzZShjb250ZW50cyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gaWdub3JlIGZvciBub3cgLSBubyB2ZXJzaW9uIHRvIHNwZWNpZnkgaW4gdGhpcyBjYXNlXG4gICAgfVxuXG4gICAgY29uc3QgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpO1xuXG4gICAgaWYgKHBhY2thZ2VKU09OICYmIHBhY2thZ2VKU09OLnZlcnNpb24pIHtcbiAgICAgICAgcHJvZ3JhbS52ZXJzaW9uKHBhY2thZ2VKU09OLnZlcnNpb24sICctdiwgLS12ZXJzaW9uJyk7XG4gICAgICAgIHByb2dyYW0uZGVzY3JpcHRpb24ocGFja2FnZUpTT04uZGVzY3JpcHRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxudW1iZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgbGV0IHJlc291cmNlVXJsUHJlc2VudCA9IGZhbHNlO1xuICAgICAgICBwcm9ncmFtXG4gICAgICAgICAgICAuYXJndW1lbnRzKCc8cmVzb3VyY2VVcmw+JylcbiAgICAgICAgICAgIC5vcHRpb24oJy1vLCAtLW91dERpciA8b3V0RGlyPicsICdCYXNlIG91dHB1dCBkaXJlY3Rvcnkgd2hlcmUgc291cmNlIGZpbGVzIHNob3VsZCBiZSBvdXRwdXQgdG8nKVxuICAgICAgICAgICAgLm9wdGlvbignLWksIC0taW5jbHVkZSA8aW5jbHVkZVBhdHRlcm4+JywgJ0luY2x1ZGUgcGF0dGVybiB0byBhcHBseSB3aGVuIHNlbGVjdGluZyBzb3VyY2UgZmlsZXMgZm9yIGV4dHJhY3Rpb24nKVxuICAgICAgICAgICAgLm9wdGlvbignLWUsIC0tZXhjbHVkZSA8ZXhjbHVkZVBhdHRlcm4+JywgJ0V4Y2x1ZGUgcGF0dGVybiB0byBhcHBseSB3aGVuIHNlbGVjdGluZyBzb3VyY2UgZmlsZXMgZm9yIGV4dHJhY3Rpb24gKGV4ZWN1dGVkIGFmdGVyIGluY2x1ZGUgcGF0dGVybiknKVxuICAgICAgICAgICAgLmFjdGlvbigocmVzb3VyY2VVcmw6IHN0cmluZywgb3B0aW9uczogT3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIHJlc291cmNlVXJsUHJlc2VudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGV0IHJlYWxSZXNvdXJjZVVybDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZWFsUmVzb3VyY2VVcmwgPSBuZXcgVVJMKHJlc291cmNlVXJsKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiSW52YWxpZCByZXNvdXJjZVVybCBwcm92aWRlZDogXCIgKyBlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZXh0cmFjdFNyY1RvRGlyKHJlYWxSZXNvdXJjZVVybCwgbnVsbCwgb3B0aW9ucy5vdXREaXIsIHVuZGVmaW5lZCwgb3B0aW9ucy5pbmNsdWRlID8gbmV3IFJlZ0V4cChvcHRpb25zLmluY2x1ZGUpIDogdW5kZWZpbmVkLCBvcHRpb25zLmV4Y2x1ZGUgPyBuZXcgUmVnRXhwKG9wdGlvbnMuZXhjbHVkZSkgOiB1bmRlZmluZWQpLnRoZW4oKCkgPT4gcmVzb2x2ZSgwKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBwcm9ncmFtLnBhcnNlKGFyZ3MpO1xuICAgICAgICBpZiAoIXJlc291cmNlVXJsUHJlc2VudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gcmVzb3VyY2UgdXJsIHByb3ZpZGVkJyk7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIHJlc291cmNlIHVybCBwcm92aWRlZCcpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBhcmUgd2UgXCJyZXF1aXJlZC9pbXBvcnRlZFwiIG9yIGNhbGxlZCBmcm9tIGNvbW1hbmQgbGluZT9cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICAgIGNsaShwcm9jZXNzLmFyZ3YpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChyZXN1bHQpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfSk7XG59XG5cbiJdfQ==