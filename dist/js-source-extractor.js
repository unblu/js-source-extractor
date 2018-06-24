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
                console.error(util.format('Problem reading %s: %s', resourceUrl, error));
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
            baseDir = __dirname + path_1.default.sep + 'extract';
            if (outDir) {
                baseDir = outDir;
            }
            return [2 /*return*/, extractSrc(resourceUrl, null, function (path, sourceName, source) {
                    mkdirPathSync(baseDir + path);
                    try {
                        fs_2.default.writeFileSync(outDir + path + sourceName, source);
                    }
                    catch (error) {
                        console.error(util.format("Problem while writing file %s: %s", outDir + path + sourceName, error));
                    }
                    console.info(util.format("Source %s written", outDir + path + sourceName));
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
                    if (!!rawMap) return [3 /*break*/, 2];
                    if (!resourceUrl) {
                        throw Error('No or invalid sourceMap and no or invalid resourceUrl provided');
                    }
                    return [4 /*yield*/, loadMap(resourceUrl)];
                case 1:
                    rawMap = _a.sent();
                    _a.label = 2;
                case 2:
                    if (srcInclude) {
                        srcIncludeEff = srcInclude;
                    }
                    else {
                        srcIncludeEff = /.*/;
                    }
                    return [4 /*yield*/, source_map_1.SourceMapConsumer.with(rawMap, null, function (consumer) {
                            console.info(util.format("Source map references %d source files", consumer.sources.length));
                            consumer.sources.forEach(function (sourceRef) {
                                if (!srcIncludeEff.test(sourceRef) || (srcExclude && srcExclude.test(sourceRef))) {
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
        var contents = fs_2.default.readFileSync('package.json').toString('utf-8');
        packageJSON = JSON.parse(contents);
    }
    catch (error) {
        // ignore for now - no version to specify in this case
    }
    var program = require('commander');
    if (packageJSON && packageJSON.version) {
        program.version(packageJSON.version);
        program.description(packageJSON.description);
    }
    return new Promise(function (resolve, reject) {
        var resourceUrlPresent = false;
        program
            .arguments('<resourceUrl>')
            .option('-o --outDir <outDir>', 'Base output directory where source files should be output to')
            .option('-i --include <includePattern>', 'Include pattern to apply when selecting source files for extraction')
            .option('-e --exclude <excludePattern>', 'Exclude pattern to apply when selecting source files for extraction (executed after include pattern)')
            .action(function (resourceUrl, options) {
            console.log(resourceUrl);
            resourceUrlPresent = true;
            var realResourceUrl;
            try {
                realResourceUrl = new url_1.URL(resourceUrl);
            }
            catch (error) {
                reject(new Error("Invalid resourceUrl provided: " + error));
                return;
            }
            extractSrcToDir(realResourceUrl, null, options.outDir, undefined, options.includePattern ? new RegExp(options.includePattern) : undefined, options.excludePattern ? new RegExp(options.excludePattern) : undefined).then(function () { return resolve(0); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtc291cmNlLWV4dHJhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qcy1zb3VyY2UtZXh0cmFjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFBLHlDQUE4QztBQUM5QyxpREFBcUM7QUFDckMsK0NBQW1DO0FBQ25DLHlDQUE2QjtBQUM3QiwyQkFBd0I7QUFFeEIseUJBQWdDO0FBQ2hDLDBDQUFvQjtBQUNwQiw4Q0FBd0I7QUFDeEIsNENBQXNCO0FBQ3RCLDhDQUF3QjtBQUV4Qiw0QkFBNEI7QUFDNUIsNEJBQTRCO0FBQzVCLDRCQUE0QjtBQUc1Qix1QkFBdUIsU0FBaUI7SUFDcEMsSUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixJQUFNLE9BQU8sR0FBRyxjQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN0RCxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFFcEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxTQUFTLEVBQUUsUUFBUTtRQUM1QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUQsSUFBSTtZQUNBLFlBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ3ZCLE1BQU0sR0FBRyxDQUFDO2FBQ2I7U0FDSjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQixDQUFDO0FBRUQsc0JBQXNC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QUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQVYsQ0FBVSxDQUFDLENBQUM7UUFDL08sQ0FBQyxDQUFDLENBQUM7UUFFUCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7WUFDOUMsT0FBTztTQUNWO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBN0NELGtCQTZDQztBQUVELDBEQUEwRDtBQUMxRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO0lBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQ1osSUFBSSxDQUFDLFVBQUMsTUFBTTtRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDeEIsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLFVBQUMsS0FBSztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQUM7Q0FDViIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuLypcbiAqIGpzLXNvdXJjZS1leHRyYWN0b3JcbiAqIENvcHlyaWdodChjKSAyMDE4IEtheSBIdWJlclxuICogSVNDIExpY2Vuc2VkXG4gKi9cblxuaW1wb3J0IHsgU291cmNlTWFwQ29uc3VtZXJ9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0ICogYXMgaHR0cHNDbGllbnQgZnJvbSAnaHR0cHMnO1xuaW1wb3J0ICogYXMgaHR0cENsaWVudCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQge1VSTH0gZnJvbSBcInVybFwiO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gXCJmc1wiO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IG1pbWUgZnJvbSAnbWltZSc7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKiogKi9cbi8qIHV0aWxpdGllcyAgICAgICAgICAgICAgKi9cbi8qICoqKioqKioqKioqKioqKioqKioqKiogKi9cblxuXG5mdW5jdGlvbiBta2RpclBhdGhTeW5jKHRhcmdldERpcjogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2VwID0gcGF0aC5zZXA7XG4gICAgY29uc3QgaW5pdERpciA9IHBhdGguaXNBYnNvbHV0ZSh0YXJnZXREaXIpID8gc2VwIDogJyc7XG4gICAgY29uc3QgYmFzZURpciA9ICcuJztcblxuICAgIHRhcmdldERpci5zcGxpdChzZXApLnJlZHVjZSgocGFyZW50RGlyLCBjaGlsZERpcikgPT4ge1xuICAgICAgICBjb25zdCBjdXJEaXIgPSBwYXRoLnJlc29sdmUoYmFzZURpciwgcGFyZW50RGlyLCBjaGlsZERpcik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5ta2RpclN5bmMoY3VyRGlyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1ckRpcjtcbiAgICB9LCBpbml0RGlyKTtcbn1cblxuZnVuY3Rpb24gbG9hZFJlc291cmNlKHJlc291cmNlVXJsOiBVUkwpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnNvbGUuaW5mbyh1dGlsLmZvcm1hdChcIlJlYWRpbmcgY29udGVudHMgb2YgJXNcIiwgcmVzb3VyY2VVcmwpKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBodHRwRm4gPSAocmVzOiBodHRwLkluY29taW5nTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlc3BvbnNlQm9keSA9IFwiXCI7XG4gICAgICAgICAgICByZXMub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlQm9keSArPSBjaHVuaztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzLm9uKFwiZW5kXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwic291cmNlIG1hcCByZXNwb25zZSBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlQm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocmVzb3VyY2VVcmwucHJvdG9jb2wgPT09ICdodHRwczonKSB7XG4gICAgICAgICAgICBodHRwc0NsaWVudC5yZXF1ZXN0KHJlc291cmNlVXJsLCBodHRwRm4pLmVuZCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlVXJsLnByb3RvY29sID09PSAnaHR0cDonKSB7XG4gICAgICAgICAgICBodHRwQ2xpZW50LnJlcXVlc3QocmVzb3VyY2VVcmwsIGh0dHBGbikuZW5kKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2VVcmwucHJvdG9jb2wgPT09ICdmaWxlOicpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVhZEZpbGVTeW5jKHJlc291cmNlVXJsKS50b1N0cmluZygnVVRGLTgnKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodXRpbC5mb3JtYXQoJ1Byb2JsZW0gcmVhZGluZyAlczogJXMnLCByZXNvdXJjZVVybCwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRNYXAocmVzb3VyY2VVcmw6IFVSTCwgcmVzb3VyY2VUeXBlPzogUmVzb3VyY2VUeXBlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJMb2FkaW5nIHJlc291cmNlICVzIHRvIGV4YW1pbmUgKGV4cGVjdGluZyBqYXZhc2NyaXB0IG9yIHNvdXJjZSBtYXApXCIsIHJlc291cmNlVXJsKSk7XG5cbiAgICBpZiAoIXJlc291cmNlVHlwZSkge1xuICAgICAgICBjb25zdCBndWVzc2VkVHlwZSA9IG1pbWUuZ2V0VHlwZShyZXNvdXJjZVVybC5wYXRobmFtZSk7XG4gICAgICAgIGlmIChndWVzc2VkVHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKSB7XG4gICAgICAgICAgICByZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGUuSkFWQVNDUklQVDtcbiAgICAgICAgfSBlbHNlIGlmIChndWVzc2VkVHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICAgICAgICByZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGUuU09VUkNFX01BUDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKHV0aWwuZm9ybWF0KCdObyByZXNvdXJjZSB0eXBlIHNwZWNpZmllZCBhbmQgdGhlIGd1ZXNzZWQgb25lIFxcJyVzXFwnIGlzIHVucmVjb2duaXplZC4nLCBndWVzc2VkVHlwZSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5pbmZvKHV0aWwuZm9ybWF0KCdSZXNvdXJjZSB3aWxsIGJlIHRyZWF0ZWQgYXMgYSAlcycsIHJlc291cmNlVHlwZS52YWx1ZU9mKCkpKTtcbiAgICBsZXQgcmVzb3VyY2VDb250ZW50ID0gYXdhaXQgbG9hZFJlc291cmNlKHJlc291cmNlVXJsKTtcblxuICAgIGlmIChyZXNvdXJjZVR5cGUgPT09IFJlc291cmNlVHlwZS5KQVZBU0NSSVBUKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZU1hcFByZWZpeCA9IFsnLy9AIHNvdXJjZU1hcHBpbmdVUkw9JywgJy8vIyBzb3VyY2VNYXBwaW5nVVJMPSddO1xuXG4gICAgICAgIGxldCBtYXBVcmxJbmRleCA9IC0xO1xuICAgICAgICBzb3VyY2VNYXBQcmVmaXguc29tZSgocHJlZml4KSA9PiB7XG4gICAgICAgICAgICBtYXBVcmxJbmRleCA9IHJlc291cmNlQ29udGVudC5pbmRleE9mKHByZWZpeCk7XG4gICAgICAgICAgICByZXR1cm4gbWFwVXJsSW5kZXggIT09IC0xO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBsb2NhdGUgLy9AIHNvdXJjZU1hcHBpbmdVUkw9IGFuZCBleGFtaW5lIHRoZSBzdHJpbmcgYWZ0ZXJ3YXJkc1xuICAgICAgICBpZiAobWFwVXJsSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignTm8gZW1iZWRkZWQgc291cmNlIG1hcCB1cmwgaGFzIGJlZW4gZm91bmQuIElzIHRoZSBzb3VyY2UgbWFwIGluIGEgc2VwYXJhdGUgZmlsZT8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUuaW5mbygnRm91bmQgc291cmNlIG1hcCB1cmwnKTtcblxuICAgICAgICBjb25zdCBtYXBVcmwgPSByZXNvdXJjZUNvbnRlbnQuc3Vic3RyaW5nKG1hcFVybEluZGV4ICsgJy8vQCBzb3VyY2VNYXBwaW5nVVJMPScubGVuZ3RoKTtcbiAgICAgICAgaWYgKG1hcFVybC5zdGFydHNXaXRoKCdkYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCcpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ0V4dHJhY3RpbmcgZW1iZWRkZWQgc291cmNlIG1hcCcpO1xuXG4gICAgICAgICAgICAvLyBtYXAgdXJsIGlzIG5vdCBhIG1hcCB1cmwgYnV0IGRpcmVjdGx5IHRoZSBtYXAgY29udGVudHNcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5mcm9tKG1hcFVybC5zdWJzdHJpbmcoJ2RhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsJy5sZW5ndGgpLCBcImJhc2U2NFwiKTtcbiAgICAgICAgICAgIHJlc291cmNlQ29udGVudCA9IGJ1Zi50b1N0cmluZygnVVRGLTgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGxvYWQgc291cmNlIG1hcCBmcm9tIHVybFxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiRm91bmQgc291cmNlIG1hcCB1cmwgaW5zaWRlIGphdmFzY3JpcHQgZmlsZS5cIik7XG4gICAgICAgICAgICByZXNvdXJjZUNvbnRlbnQgPSBhd2FpdCBsb2FkUmVzb3VyY2UobmV3IFVSTChtYXBVcmwsIHJlc291cmNlVXJsKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb3VyY2VDb250ZW50O1xufVxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqICovXG4vKiBtYWluIGV4cG9ydGVkIGZ1bmN0aW9uYWxpdGllcyAqL1xuLyogKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKipcbiAqIFR5cGUgb2YgcmVzb3VyY2UuIFJlcXVpcmVkIGlmIG5vdCBhdXRvbWF0aWNhbGx5IGRldGVybWluYWJsZS5cbiAqL1xuZXhwb3J0IGVudW0gUmVzb3VyY2VUeXBlIHtcbiAgICBKQVZBU0NSSVBUID0gJ0phdmFzY3JpcHQnLFxuICAgIFNPVVJDRV9NQVAgPSAnU291cmNlIE1hcCdcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHNvdXJjZSBjb2RlIGZyb20gZWl0aGVyIGEgcHJvdmlkZWQgSmF2YXNjcmlwdCBmaWxlIGNvbnRhaW5pbmcgYSBzb3VyY2UgbWFwIGluZm9ybWF0aW9uLCBhIFNvdXJjZSBNYXAgZmlsZSBvciBhIHNvdXJjZSBtYXAgaW4gc3RyaW5nIGZvcm0uXG4gKiBTb3VyY2UgY29kZSBmaWxlcyBtdXN0IGVpdGhlciBiZSByZWZlcmVuY2VkIGFuZCBhY2Nlc3NpYmxlIHZpYSBpbmZvcm1hdGlvbiBpbiB0aGUgc291cmNlIG1hcCBvciBiZSBjb250YWluZWQgaW4gdGhlIHNvdXJjZSBtYXAgKGVtYmVkZGVkKS5cbiAqXG4gKiBUaGUgZXh0cmFjdGVkIHNvdXJjZSBjb2RlIGlzIHN0b3JlZCBpbiB0aGUgZmlsZSBzeXN0ZW0uIFRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIHRoYXQgaXMgcHJvdmlkZWQgd2l0aCB0aGUgc291cmNlIGZpbGUgcGF0aCBpbmZvcm1hdGlvbiBpbiB0aGUgc291cmNlIG1hcCB3aWxsIGJlIGNyZWF0ZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBganNcbiAqIGNvbnN0IGJhc2VEaXIgPSBfX2Rpcm5hbWUgKyBcIi8uLi9yZXNvdXJjZXNcIjtcbiAqIGNvbnN0IG91dERpciA9IHRtcGRpcigpICsgcGF0aC5zZXAgKyAnanMtc291cmNlLWV4dHJhY3Rvci10ZXN0JzsgLy8gZGlyZWN0b3J5IHRvIHN0b3JlIHNvdXJjZSBmaWxlcyBpblxuICogYXdhaXQgZXh0cmFjdFNyY1RvRGlyKG5ldyBVUkwodXRpbC5mb3JtYXQoJ2ZpbGU6Ly8lcy9lbWJlZGRlZC1zb3VyY2VtYXAtdGVzdC5qcycsIGJhc2VEaXIpKSwgb3V0RGlyKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkwgfCBudWxsfSByZXNvdXJjZVVybCBBbiB1cmwgKGh0dHAocyk6Ly8gb3IgZmlsZTovLyBmb3IgbG9jYWwgZmlsZSBhY2Nlc3MpIHRvIHJldHJpZXZlIGVpdGhlciBhIEphdmFzY3JpcHQgZmlsZSBvciBhIFNvdXJjZSBNYXAgZmlsZS4gSWYgbnVsbCwgc291cmNlTWFwIG11c3QgYmUgc3BlY2lmaWVkLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsfSBzb3VyY2VNYXAgU291cmNlIE1hcCBKU09OIGluIHN0cmluZyBmb3JtIHRvIHVzZSBkaXJlY3RseS4gTXVzdCBjb250YWluIHNvdXJjZSBjb2RlIG9yIHJlZmVyIHdpdGggYWJzb2x1dGUgdXJscyB0byBzb3VyY2UgZmlsZXMuIElmIG51bGwsIHJlc291cmNlVXJsIG11c3QgYmUgc3BlY2lmaWVkLlxuICogQHBhcmFtIHtzdHJpbmd9IG91dERpciBEaXJlY3Rvcnkgd2hlcmUgdGhlIHNvdXJjZSBmaWxlcyBzaG91bGQgYmUgc3RvcmVkIGludG8uXG4gKiBAcGFyYW0ge1Jlc291cmNlVHlwZX0gcmVzb3VyY2VUeXBlIE9wdGlvbmFsIHR5cGUgZGVzY3JpYmluZyB3aGV0aGVyIHRoZSByZXNvdXJjZVVybCByZWZlcmVuY2VzIGEgSmF2YXNjcmlwdCBvciBhIFNvdXJjZSBNYXAgZmlsZS4gQXV0b21hdGljIGRldGVjdGlvbiAoYWNjb3JkaW5nIHRvIHRoZSBmaWxlIG5hbWUgZXh0ZW5zaW9ucykgaXMgYXR0ZW1wdGVkIGlmIG5vdCBzcGVjaWZpZWQuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gc3JjSW5jbHVkZSBPcHRpb25hbCBwYXR0ZXJuIHRvIHRlc3QgYSBzb3VyY2UgY29kZSBwYXRoIGFnYWluc3QgYmVmb3JlIHNlbmRpbmcgaXQgdG8gdGhlIHJlY2VpdmVyLiBEZWZhdWx0cyB0byAuKlxuICogQHBhcmFtIHtSZWdFeHB9IHNyY0V4Y2x1ZGUgT3B0aW9uYWwgcGF0dGVybiB0byB0ZXN0IGEgc291cmNlIGNvZGUgcGF0aCBhZ2FpbnN0IHRvIGV4Y2x1ZGUgZnJvbSBzZW5kaW5nIGl0IHRvIHRoZSByZWNlaXZlci4gRXhjbHVkZSBwYXR0ZXJuIGlzIHRlc3RlZCBhZnRlciB0aGUgaW5jbHVkZSBwYXR0ZXJuLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEFzeW5jIGZ1bmN0aW9uIHdpdGhvdXQgYSBkaXJlY3QgcmVzdWx0ICh1c2UgcmVjZWl2ZXIgdG8gcmVjZWl2ZSBpbmZvcm1hdGlvbilcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RTcmNUb0RpcihyZXNvdXJjZVVybDogVVJMIHwgbnVsbCwgc291cmNlTWFwOiBzdHJpbmcgfCBudWxsLCBvdXREaXI/OiBzdHJpbmcsIHJlc291cmNlVHlwZT86IFJlc291cmNlVHlwZSwgc3JjSW5jbHVkZT86IFJlZ0V4cCwgc3JjRXhjbHVkZT86IFJlZ0V4cCkge1xuICAgIGxldCBiYXNlRGlyOiBzdHJpbmcgPSBfX2Rpcm5hbWUgKyBwYXRoLnNlcCArICdleHRyYWN0JztcbiAgICBpZiAob3V0RGlyKSB7XG4gICAgICAgIGJhc2VEaXIgPSBvdXREaXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dHJhY3RTcmMocmVzb3VyY2VVcmwsIG51bGwsKHBhdGgsIHNvdXJjZU5hbWUsIHNvdXJjZSkgPT4ge1xuICAgICAgICBta2RpclBhdGhTeW5jKGJhc2VEaXIgKyBwYXRoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXREaXIgKyBwYXRoICsgc291cmNlTmFtZSwgc291cmNlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodXRpbC5mb3JtYXQoXCJQcm9ibGVtIHdoaWxlIHdyaXRpbmcgZmlsZSAlczogJXNcIiwgb3V0RGlyICsgcGF0aCArIHNvdXJjZU5hbWUsIGVycm9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJTb3VyY2UgJXMgd3JpdHRlblwiLCBvdXREaXIgKyBwYXRoICsgc291cmNlTmFtZSkpO1xuICAgIH0sIHJlc291cmNlVHlwZSwgc3JjSW5jbHVkZSwgc3JjRXhjbHVkZSk7XG59XG5cbi8qKlxuICogRXh0cmFjdCBzb3VyY2UgY29kZSBmcm9tIGVpdGhlciBhIHByb3ZpZGVkIEphdmFzY3JpcHQgZmlsZSBjb250YWluaW5nIGEgc291cmNlIG1hcCBpbmZvcm1hdGlvbiwgYSBTb3VyY2UgTWFwIGZpbGUgb3IgYSBzb3VyY2UgbWFwIGluIHN0cmluZyBmb3JtLlxuICogU291cmNlIGNvZGUgZmlsZXMgbXVzdCBlaXRoZXIgYmUgcmVmZXJlbmNlZCBhbmQgYWNjZXNzaWJsZSB2aWEgaW5mb3JtYXRpb24gaW4gdGhlIHNvdXJjZSBtYXAgb3IgYmUgY29udGFpbmVkIGluIHRoZSBzb3VyY2UgbWFwIChlbWJlZGRlZCkuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYGpzXG4gKiBjb25zdCBiYXNlRGlyID0gX19kaXJuYW1lICsgXCIvLi4vcmVzb3VyY2VzXCI7XG4gKiBleHRyYWN0U3JjKG5ldyBVUkwodXRpbC5mb3JtYXQoJ2ZpbGU6Ly8lcy9lbWJlZGRlZC1zb3VyY2VtYXAtdGVzdC5qcycsIGJhc2VEaXIpKSwgbnVsbCwgKHBhdGg6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyB8IG51bGwpID0+IHtcbiAqICAgY29uc29sZS5sb2coXCJQYXRoOiBcIiArIHBhdGgpOyAgICAgICAgICAgICAgLy8gJy9zcmMnXG4gKiAgIGNvbnNvbGUubG9nKFwiU291cmNlTmFtZTogXCIgKyBzb3VyY2VOYW1lKTsgIC8vICcvZW1iZWRkZWQtc291cmNlbWFwLXRlc3QudHMnXG4gKiAgIGNvbnNvbGUubG9nKFwiU291cmNlOiBcIiArIHNvdXJjZSk7ICAgICAgICAgIC8vICdjb25zb2xlLmxvZyhcXCdIZWxsbyBXb3JsZCFcXCcpOydcbiAqIH0pO1xuICogYGBgXG4gKlxuICogTm90ZTogRWl0aGVyIHJlc291cmNlVXJsIG9yIHNvdXJjZU1hcCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqXG4gKiBAcGFyYW0ge21vZHVsZTp1cmwuVVJMIHwgbnVsbH0gcmVzb3VyY2VVcmwgQW4gdXJsIChodHRwKHMpOi8vIG9yIGZpbGU6Ly8gZm9yIGxvY2FsIGZpbGUgYWNjZXNzKSB0byByZXRyaWV2ZSBlaXRoZXIgYSBKYXZhc2NyaXB0IGZpbGUgb3IgYSBTb3VyY2UgTWFwIGZpbGUuIElmIG51bGwsIHNvdXJjZU1hcCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVsbH0gc291cmNlTWFwIFNvdXJjZSBNYXAgSlNPTiBpbiBzdHJpbmcgZm9ybSB0byB1c2UgZGlyZWN0bHkuIE11c3QgY29udGFpbiBzb3VyY2UgY29kZSBvciByZWZlciB3aXRoIGFic29sdXRlIHVybHMgdG8gc291cmNlIGZpbGVzLiBJZiBudWxsLCByZXNvdXJjZVVybCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7KHBhdGg6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IChzdHJpbmcgfCBudWxsKSkgPT4gdm9pZH0gcmVjZWl2ZXIgQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgZm9yIGVhY2ggc291cmNlIGZpbGUgcmVmZXJlbmNlZCBpbiB0aGUgc291cmNlIG1hcC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUGF0aCBpcyB0aGUgYmFzZSBwYXRoIG9mIHRoZSBzb3VyY2UgZmlsZSwgc291cmNlTmFtZSB0aGUgZmlsZSBuYW1lLCBzb3VyY2UgdGhlIHNvdXJjZSBjb2RlLCBpZiB0aGUgZmlsZSB3YXMgZm91bmRcbiAqIEBwYXJhbSB7UmVzb3VyY2VUeXBlfSByZXNvdXJjZVR5cGUgT3B0aW9uYWwgdHlwZSBkZXNjcmliaW5nIHdoZXRoZXIgdGhlIHJlc291cmNlVXJsIHJlZmVyZW5jZXMgYSBKYXZhc2NyaXB0IG9yIGEgU291cmNlIE1hcCBmaWxlLiBBdXRvbWF0aWMgZGV0ZWN0aW9uIChhY2NvcmRpbmcgdG8gdGhlIGZpbGUgbmFtZSBleHRlbnNpb25zKSBpcyBhdHRlbXB0ZWQgaWYgbm90IHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBzcmNJbmNsdWRlIE9wdGlvbmFsIHBhdHRlcm4gdG8gdGVzdCBhIHNvdXJjZSBjb2RlIHBhdGggYWdhaW5zdCBiZWZvcmUgc2VuZGluZyBpdCB0byB0aGUgcmVjZWl2ZXIuIERlZmF1bHRzIHRvIC4qXG4gKiBAcGFyYW0ge1JlZ0V4cH0gc3JjRXhjbHVkZSBPcHRpb25hbCBwYXR0ZXJuIHRvIHRlc3QgYSBzb3VyY2UgY29kZSBwYXRoIGFnYWluc3QgdG8gZXhjbHVkZSBmcm9tIHNlbmRpbmcgaXQgdG8gdGhlIHJlY2VpdmVyLiBFeGNsdWRlIHBhdHRlcm4gaXMgdGVzdGVkIGFmdGVyIHRoZSBpbmNsdWRlIHBhdHRlcm4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gQXN5bmMgZnVuY3Rpb24gd2l0aG91dCBhIGRpcmVjdCByZXN1bHQgKHVzZSByZWNlaXZlciB0byByZWNlaXZlIGluZm9ybWF0aW9uKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFNyYyhyZXNvdXJjZVVybDogVVJMIHwgbnVsbCwgc291cmNlTWFwOiBzdHJpbmcgfCBudWxsLCByZWNlaXZlcjogKHBhdGg6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyB8IG51bGwpID0+IHZvaWQsIHJlc291cmNlVHlwZT86IFJlc291cmNlVHlwZSwgc3JjSW5jbHVkZT86IFJlZ0V4cCwgc3JjRXhjbHVkZT86IFJlZ0V4cCkge1xuICAgIGxldCByYXdNYXAgPSBzb3VyY2VNYXA7XG4gICAgaWYgKCFyYXdNYXApIHtcbiAgICAgICAgaWYgKCFyZXNvdXJjZVVybCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ05vIG9yIGludmFsaWQgc291cmNlTWFwIGFuZCBubyBvciBpbnZhbGlkIHJlc291cmNlVXJsIHByb3ZpZGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICByYXdNYXAgPSBhd2FpdCBsb2FkTWFwKHJlc291cmNlVXJsKTtcbiAgICB9XG5cbiAgICBsZXQgc3JjSW5jbHVkZUVmZjogUmVnRXhwO1xuICAgIGlmIChzcmNJbmNsdWRlKSB7XG4gICAgICAgIHNyY0luY2x1ZGVFZmYgPSBzcmNJbmNsdWRlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNyY0luY2x1ZGVFZmYgPSAvLiovO1xuICAgIH1cblxuXG4gICAgYXdhaXQgU291cmNlTWFwQ29uc3VtZXIud2l0aChyYXdNYXAsIG51bGwsIChjb25zdW1lcikgPT4ge1xuICAgICAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJTb3VyY2UgbWFwIHJlZmVyZW5jZXMgJWQgc291cmNlIGZpbGVzXCIsIGNvbnN1bWVyLnNvdXJjZXMubGVuZ3RoKSk7XG5cbiAgICAgICAgY29uc3VtZXIuc291cmNlcy5mb3JFYWNoKChzb3VyY2VSZWYpID0+IHtcbiAgICAgICAgICAgIGlmICghc3JjSW5jbHVkZUVmZi50ZXN0KHNvdXJjZVJlZikgfHwgKHNyY0V4Y2x1ZGUgJiYgc3JjRXhjbHVkZS50ZXN0KHNvdXJjZVJlZikpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzb3VyY2VSZWZVcmwgPSB1cmwucGFyc2Uoc291cmNlUmVmKTtcbiAgICAgICAgICAgIGxldCBwYXRoTmFtZSA9IHNvdXJjZVJlZlVybC5wYXRobmFtZSArIChzb3VyY2VSZWZVcmwucXVlcnkgPyBzb3VyY2VSZWZVcmwucXVlcnkgOiAnJykgKyAoc291cmNlUmVmVXJsLmhhc2ggPyBzb3VyY2VSZWZVcmwuaGFzaCA6ICcnKTtcbiAgICAgICAgICAgIGxldCBmaWxlTmFtZSA9IHBhdGhOYW1lO1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gY29uc3VtZXIuc291cmNlQ29udGVudEZvcihzb3VyY2VSZWYsIHRydWUpO1xuICAgICAgICAgICAgaWYgKHBhdGhOYW1lLmxhc3RJbmRleE9mKHBhdGguc2VwKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aE5hbWUuc3Vic3RyaW5nKHBhdGhOYW1lLmxhc3RJbmRleE9mKHBhdGguc2VwKSk7XG4gICAgICAgICAgICAgICAgcGF0aE5hbWUgPSBwYXRoTmFtZS5zdWJzdHJpbmcoMCwgcGF0aE5hbWUubGFzdEluZGV4T2YocGF0aC5zZXApKTtcblxuICAgICAgICAgICAgICAgIC8vIGRyb3AgYW55IGxlYWRpbmcgcmVsYXRpdmUgcGF0aCBjb25zdHJ1Y3RzXG4gICAgICAgICAgICAgICAgcGF0aE5hbWUgPSBwYXRoTmFtZS5yZXBsYWNlKC9bXFxcXF0rL2csICcvJyk7XG4gICAgICAgICAgICAgICAgcGF0aE5hbWUgPSBwYXRoLnNlcCArIHBhdGhOYW1lLnJlcGxhY2UoL15bLi9dKy8sICcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBzYWtlIG9mIGNvbnNpc3RlbmN5IHdpdGggYWJzb2x1dGUgcGF0aCBjYXNlcywgd2UgZW1wdHkgcGF0aCBhbmQgYXBwZW5kIGEgc2xhc2ggb24gZmlsZU5hbWVcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gJy8nICsgZmlsZU5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlY2VpdmVyKHBhdGhOYW1lLCBmaWxlTmFtZSwgc291cmNlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKiogKi9cbi8qIGV4cG9ydHMgICAgICAgICAgICAgICAgKi9cbi8qICoqKioqKioqKioqKioqKioqKioqKiogKi9cbmV4cG9ydHMuUmVzb3VyY2VUeXBlID0gUmVzb3VyY2VUeXBlO1xuZXhwb3J0cy5leHRyYWN0U3JjVG9EaXIgPSBleHRyYWN0U3JjVG9EaXI7XG5leHBvcnRzLmV4dHJhY3RTcmMgPSBleHRyYWN0U3JjO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqICovXG4vKiBjb21tYW5kIGxpbmUgICAgICAgICAgICovXG4vKiAqKioqKioqKioqKioqKioqKioqKioqICovXG5cbmludGVyZmFjZSBPcHRpb25zIHtcbiAgICBvdXREaXI6IHN0cmluZztcbiAgICBpbmNsdWRlUGF0dGVybj86IHN0cmluZztcbiAgICBleGNsdWRlUGF0dGVybj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDb21tYW5kIGxpbmUgaW50ZXJmYWNlIC0gd3JhcHBlZCBpbiBhIGZ1bmN0aW9uIGZvciBiZXR0ZXIgdGVzdGFiaWxpdHlcbiAqXG4gKiBgYGBqc1xuICogcHJvY2Vzcy5leGl0KGNsaShwcm9jZXNzLmFyZ3YpKTtcbiAqIGBgYFxuICogQHBhcmFtIHtzdHJpbmdbXX0gYXJncyBjb21tYW5kIGxpbmUgYXJndW1lbnRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBub24temVybyBudW1iZXJzIGluZGljYXRlIGFuIGVycm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGkoYXJnczogc3RyaW5nW10pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBwYWNrYWdlSlNPTjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYygncGFja2FnZS5qc29uJykudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgICAgIHBhY2thZ2VKU09OID0gSlNPTi5wYXJzZShjb250ZW50cyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gaWdub3JlIGZvciBub3cgLSBubyB2ZXJzaW9uIHRvIHNwZWNpZnkgaW4gdGhpcyBjYXNlXG4gICAgfVxuXG4gICAgY29uc3QgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpO1xuXG4gICAgaWYgKHBhY2thZ2VKU09OICYmIHBhY2thZ2VKU09OLnZlcnNpb24pIHtcbiAgICAgICAgcHJvZ3JhbS52ZXJzaW9uKHBhY2thZ2VKU09OLnZlcnNpb24pO1xuICAgICAgICBwcm9ncmFtLmRlc2NyaXB0aW9uKHBhY2thZ2VKU09OLmRlc2NyaXB0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8bnVtYmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCByZXNvdXJjZVVybFByZXNlbnQgPSBmYWxzZTtcbiAgICAgICAgcHJvZ3JhbVxuICAgICAgICAgICAgLmFyZ3VtZW50cygnPHJlc291cmNlVXJsPicpXG4gICAgICAgICAgICAub3B0aW9uKCctbyAtLW91dERpciA8b3V0RGlyPicsICdCYXNlIG91dHB1dCBkaXJlY3Rvcnkgd2hlcmUgc291cmNlIGZpbGVzIHNob3VsZCBiZSBvdXRwdXQgdG8nKVxuICAgICAgICAgICAgLm9wdGlvbignLWkgLS1pbmNsdWRlIDxpbmNsdWRlUGF0dGVybj4nLCAnSW5jbHVkZSBwYXR0ZXJuIHRvIGFwcGx5IHdoZW4gc2VsZWN0aW5nIHNvdXJjZSBmaWxlcyBmb3IgZXh0cmFjdGlvbicpXG4gICAgICAgICAgICAub3B0aW9uKCctZSAtLWV4Y2x1ZGUgPGV4Y2x1ZGVQYXR0ZXJuPicsICdFeGNsdWRlIHBhdHRlcm4gdG8gYXBwbHkgd2hlbiBzZWxlY3Rpbmcgc291cmNlIGZpbGVzIGZvciBleHRyYWN0aW9uIChleGVjdXRlZCBhZnRlciBpbmNsdWRlIHBhdHRlcm4pJylcbiAgICAgICAgICAgIC5hY3Rpb24oKHJlc291cmNlVXJsOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNvdXJjZVVybCk7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VVcmxQcmVzZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBsZXQgcmVhbFJlc291cmNlVXJsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWxSZXNvdXJjZVVybCA9IG5ldyBVUkwocmVzb3VyY2VVcmwpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJJbnZhbGlkIHJlc291cmNlVXJsIHByb3ZpZGVkOiBcIiArIGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBleHRyYWN0U3JjVG9EaXIocmVhbFJlc291cmNlVXJsLCBudWxsLCBvcHRpb25zLm91dERpciwgdW5kZWZpbmVkLCBvcHRpb25zLmluY2x1ZGVQYXR0ZXJuID8gbmV3IFJlZ0V4cChvcHRpb25zLmluY2x1ZGVQYXR0ZXJuKSA6IHVuZGVmaW5lZCwgb3B0aW9ucy5leGNsdWRlUGF0dGVybiA/IG5ldyBSZWdFeHAob3B0aW9ucy5leGNsdWRlUGF0dGVybikgOiB1bmRlZmluZWQpLnRoZW4oKCkgPT4gcmVzb2x2ZSgwKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBwcm9ncmFtLnBhcnNlKGFyZ3MpO1xuICAgICAgICBpZiAoIXJlc291cmNlVXJsUHJlc2VudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gcmVzb3VyY2UgdXJsIHByb3ZpZGVkJyk7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIHJlc291cmNlIHVybCBwcm92aWRlZCcpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBhcmUgd2UgXCJyZXF1aXJlZC9pbXBvcnRlZFwiIG9yIGNhbGxlZCBmcm9tIGNvbW1hbmQgbGluZT9cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICAgIGNsaShwcm9jZXNzLmFyZ3YpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChyZXN1bHQpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfSk7XG59XG5cbiJdfQ==