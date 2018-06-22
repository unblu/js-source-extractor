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
exports.ResourceType = ResourceType;
exports.extractSrcToDir = extractSrcToDir;
exports.extractSrc = extractSrc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtc291cmNlLWV4dHJhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qcy1zb3VyY2UtZXh0cmFjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHlDQUE4QztBQUM5QyxpREFBcUM7QUFDckMsK0NBQW1DO0FBQ25DLHlDQUE2QjtBQUM3QiwyQkFBd0I7QUFFeEIseUJBQWdDO0FBQ2hDLDBDQUFvQjtBQUNwQiw4Q0FBd0I7QUFDeEIsNENBQXNCO0FBQ3RCLDhDQUF3QjtBQUV4Qix1QkFBdUIsU0FBaUI7SUFDcEMsSUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixJQUFNLE9BQU8sR0FBRyxjQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN0RCxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFFcEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxTQUFTLEVBQUUsUUFBUTtRQUM1QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUQsSUFBSTtZQUNBLFlBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ3ZCLE1BQU0sR0FBRyxDQUFDO2FBQ2I7U0FDSjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQixDQUFDO0FBRUQsc0JBQXNCLFdBQWdCO0lBQ2xDLE9BQU8sQ0FBQyxJQUFJ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LENBQUMsQ0FBQyxFQUFFO29DQUN0QyxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGNBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29DQUM5RCxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxjQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQ0FFakUsNENBQTRDO29DQUM1QyxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7b0NBQzNDLFFBQVEsR0FBRyxjQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lDQUN4RDtxQ0FBTTtvQ0FDSCxxR0FBcUc7b0NBQ3JHLFFBQVEsR0FBRyxFQUFFLENBQUM7b0NBQ2QsUUFBUSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUM7aUNBQzdCO2dDQUVELFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN6QyxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsRUFBQTs7b0JBM0JGLFNBMkJFLENBQUM7Ozs7O0NBQ047QUE5Q0QsZ0NBOENDO0FBRUQsT0FBTyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDcEMsT0FBTyxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7QUFDMUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICoganMtc291cmNlLWV4dHJhY3RvclxuICogQ29weXJpZ2h0KGMpIDIwMTggS2F5IEh1YmVyXG4gKiBJU0MgTGljZW5zZWRcbiAqL1xuXG5pbXBvcnQgeyBTb3VyY2VNYXBDb25zdW1lcn0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQgKiBhcyBodHRwc0NsaWVudCBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBodHRwQ2xpZW50IGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCB7VVJMfSBmcm9tIFwidXJsXCI7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSBcImZzXCI7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgbWltZSBmcm9tICdtaW1lJztcblxuZnVuY3Rpb24gbWtkaXJQYXRoU3luYyh0YXJnZXREaXI6IHN0cmluZykge1xuICAgIGNvbnN0IHNlcCA9IHBhdGguc2VwO1xuICAgIGNvbnN0IGluaXREaXIgPSBwYXRoLmlzQWJzb2x1dGUodGFyZ2V0RGlyKSA/IHNlcCA6ICcnO1xuICAgIGNvbnN0IGJhc2VEaXIgPSAnLic7XG5cbiAgICB0YXJnZXREaXIuc3BsaXQoc2VwKS5yZWR1Y2UoKHBhcmVudERpciwgY2hpbGREaXIpID0+IHtcbiAgICAgICAgY29uc3QgY3VyRGlyID0gcGF0aC5yZXNvbHZlKGJhc2VEaXIsIHBhcmVudERpciwgY2hpbGREaXIpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGN1ckRpcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSAnRUVYSVNUJykge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJEaXI7XG4gICAgfSwgaW5pdERpcik7XG59XG5cbmZ1bmN0aW9uIGxvYWRSZXNvdXJjZShyZXNvdXJjZVVybDogVVJMKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zb2xlLmluZm8odXRpbC5mb3JtYXQoXCJSZWFkaW5nIGNvbnRlbnRzIG9mICVzXCIsIHJlc291cmNlVXJsKSk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgaHR0cEZuID0gKHJlczogaHR0cC5JbmNvbWluZ01lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxldCByZXNwb25zZUJvZHkgPSBcIlwiO1xuICAgICAgICAgICAgcmVzLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgICAgICByZXNwb25zZUJvZHkgKz0gY2h1bms7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcy5vbihcImVuZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcInNvdXJjZSBtYXAgcmVzcG9uc2UgY29tcGxldGVcIik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZUJvZHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlc291cmNlVXJsLnByb3RvY29sID09PSAnaHR0cHM6Jykge1xuICAgICAgICAgICAgaHR0cHNDbGllbnQucmVxdWVzdChyZXNvdXJjZVVybCwgaHR0cEZuKS5lbmQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZVVybC5wcm90b2NvbCA9PT0gJ2h0dHA6Jykge1xuICAgICAgICAgICAgaHR0cENsaWVudC5yZXF1ZXN0KHJlc291cmNlVXJsLCBodHRwRm4pLmVuZCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlVXJsLnByb3RvY29sID09PSAnZmlsZTonKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlYWRGaWxlU3luYyhyZXNvdXJjZVVybCkudG9TdHJpbmcoJ1VURi04Jyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHV0aWwuZm9ybWF0KCdQcm9ibGVtIHJlYWRpbmcgJXM6ICVzJywgcmVzb3VyY2VVcmwsIGVycm9yKSk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkTWFwKHJlc291cmNlVXJsOiBVUkwsIHJlc291cmNlVHlwZT86IFJlc291cmNlVHlwZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc29sZS5pbmZvKHV0aWwuZm9ybWF0KFwiTG9hZGluZyByZXNvdXJjZSAlcyB0byBleGFtaW5lIChleHBlY3RpbmcgamF2YXNjcmlwdCBvciBzb3VyY2UgbWFwKVwiLCByZXNvdXJjZVVybCkpO1xuXG4gICAgaWYgKCFyZXNvdXJjZVR5cGUpIHtcbiAgICAgICAgY29uc3QgZ3Vlc3NlZFR5cGUgPSBtaW1lLmdldFR5cGUocmVzb3VyY2VVcmwucGF0aG5hbWUpO1xuICAgICAgICBpZiAoZ3Vlc3NlZFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jykge1xuICAgICAgICAgICAgcmVzb3VyY2VUeXBlID0gUmVzb3VyY2VUeXBlLkpBVkFTQ1JJUFQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZ3Vlc3NlZFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgICAgICAgcmVzb3VyY2VUeXBlID0gUmVzb3VyY2VUeXBlLlNPVVJDRV9NQVA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcih1dGlsLmZvcm1hdCgnTm8gcmVzb3VyY2UgdHlwZSBzcGVjaWZpZWQgYW5kIHRoZSBndWVzc2VkIG9uZSBcXCclc1xcJyBpcyB1bnJlY29nbml6ZWQuJywgZ3Vlc3NlZFR5cGUpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUuaW5mbyh1dGlsLmZvcm1hdCgnUmVzb3VyY2Ugd2lsbCBiZSB0cmVhdGVkIGFzIGEgJXMnLCByZXNvdXJjZVR5cGUudmFsdWVPZigpKSk7XG4gICAgbGV0IHJlc291cmNlQ29udGVudCA9IGF3YWl0IGxvYWRSZXNvdXJjZShyZXNvdXJjZVVybCk7XG5cbiAgICBpZiAocmVzb3VyY2VUeXBlID09PSBSZXNvdXJjZVR5cGUuSkFWQVNDUklQVCkge1xuICAgICAgICBjb25zdCBzb3VyY2VNYXBQcmVmaXggPSBbJy8vQCBzb3VyY2VNYXBwaW5nVVJMPScsICcvLyMgc291cmNlTWFwcGluZ1VSTD0nXTtcblxuICAgICAgICBsZXQgbWFwVXJsSW5kZXggPSAtMTtcbiAgICAgICAgc291cmNlTWFwUHJlZml4LnNvbWUoKHByZWZpeCkgPT4ge1xuICAgICAgICAgICAgbWFwVXJsSW5kZXggPSByZXNvdXJjZUNvbnRlbnQuaW5kZXhPZihwcmVmaXgpO1xuICAgICAgICAgICAgcmV0dXJuIG1hcFVybEluZGV4ICE9PSAtMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbG9jYXRlIC8vQCBzb3VyY2VNYXBwaW5nVVJMPSBhbmQgZXhhbWluZSB0aGUgc3RyaW5nIGFmdGVyd2FyZHNcbiAgICAgICAgaWYgKG1hcFVybEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ05vIGVtYmVkZGVkIHNvdXJjZSBtYXAgdXJsIGhhcyBiZWVuIGZvdW5kLiBJcyB0aGUgc291cmNlIG1hcCBpbiBhIHNlcGFyYXRlIGZpbGU/Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmluZm8oJ0ZvdW5kIHNvdXJjZSBtYXAgdXJsJyk7XG5cbiAgICAgICAgY29uc3QgbWFwVXJsID0gcmVzb3VyY2VDb250ZW50LnN1YnN0cmluZyhtYXBVcmxJbmRleCArICcvL0Agc291cmNlTWFwcGluZ1VSTD0nLmxlbmd0aCk7XG4gICAgICAgIGlmIChtYXBVcmwuc3RhcnRzV2l0aCgnZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwnKSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdFeHRyYWN0aW5nIGVtYmVkZGVkIHNvdXJjZSBtYXAnKTtcblxuICAgICAgICAgICAgLy8gbWFwIHVybCBpcyBub3QgYSBtYXAgdXJsIGJ1dCBkaXJlY3RseSB0aGUgbWFwIGNvbnRlbnRzXG4gICAgICAgICAgICBjb25zdCBidWYgPSBCdWZmZXIuZnJvbShtYXBVcmwuc3Vic3RyaW5nKCdkYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCcubGVuZ3RoKSwgXCJiYXNlNjRcIik7XG4gICAgICAgICAgICByZXNvdXJjZUNvbnRlbnQgPSBidWYudG9TdHJpbmcoJ1VURi04Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBsb2FkIHNvdXJjZSBtYXAgZnJvbSB1cmxcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkZvdW5kIHNvdXJjZSBtYXAgdXJsIGluc2lkZSBqYXZhc2NyaXB0IGZpbGUuXCIpO1xuICAgICAgICAgICAgcmVzb3VyY2VDb250ZW50ID0gYXdhaXQgbG9hZFJlc291cmNlKG5ldyBVUkwobWFwVXJsLCByZXNvdXJjZVVybCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc291cmNlQ29udGVudDtcbn1cblxuLyoqXG4gKiBUeXBlIG9mIHJlc291cmNlLiBSZXF1aXJlZCBpZiBub3QgYXV0b21hdGljYWxseSBkZXRlcm1pbmFibGUuXG4gKi9cbmV4cG9ydCBlbnVtIFJlc291cmNlVHlwZSB7XG4gICAgSkFWQVNDUklQVCA9ICdKYXZhc2NyaXB0JyxcbiAgICBTT1VSQ0VfTUFQID0gJ1NvdXJjZSBNYXAnXG59XG5cbi8qKlxuICogRXh0cmFjdCBzb3VyY2UgY29kZSBmcm9tIGVpdGhlciBhIHByb3ZpZGVkIEphdmFzY3JpcHQgZmlsZSBjb250YWluaW5nIGEgc291cmNlIG1hcCBpbmZvcm1hdGlvbiwgYSBTb3VyY2UgTWFwIGZpbGUgb3IgYSBzb3VyY2UgbWFwIGluIHN0cmluZyBmb3JtLlxuICogU291cmNlIGNvZGUgZmlsZXMgbXVzdCBlaXRoZXIgYmUgcmVmZXJlbmNlZCBhbmQgYWNjZXNzaWJsZSB2aWEgaW5mb3JtYXRpb24gaW4gdGhlIHNvdXJjZSBtYXAgb3IgYmUgY29udGFpbmVkIGluIHRoZSBzb3VyY2UgbWFwIChlbWJlZGRlZCkuXG4gKlxuICogVGhlIGV4dHJhY3RlZCBzb3VyY2UgY29kZSBpcyBzdG9yZWQgaW4gdGhlIGZpbGUgc3lzdGVtLiBUaGUgZGlyZWN0b3J5IHN0cnVjdHVyZSB0aGF0IGlzIHByb3ZpZGVkIHdpdGggdGhlIHNvdXJjZSBmaWxlIHBhdGggaW5mb3JtYXRpb24gaW4gdGhlIHNvdXJjZSBtYXAgd2lsbCBiZSBjcmVhdGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogQHBhcmFtIHttb2R1bGU6dXJsLlVSTCB8IG51bGx9IHJlc291cmNlVXJsIEFuIHVybCAoaHR0cChzKTovLyBvciBmaWxlOi8vIGZvciBsb2NhbCBmaWxlIGFjY2VzcykgdG8gcmV0cmlldmUgZWl0aGVyIGEgSmF2YXNjcmlwdCBmaWxlIG9yIGEgU291cmNlIE1hcCBmaWxlLiBJZiBudWxsLCBzb3VyY2VNYXAgbXVzdCBiZSBzcGVjaWZpZWQuXG4gKiBAcGFyYW0ge3N0cmluZyB8IG51bGx9IHNvdXJjZU1hcCBTb3VyY2UgTWFwIEpTT04gaW4gc3RyaW5nIGZvcm0gdG8gdXNlIGRpcmVjdGx5LiBNdXN0IGNvbnRhaW4gc291cmNlIGNvZGUgb3IgcmVmZXIgd2l0aCBhYnNvbHV0ZSB1cmxzIHRvIHNvdXJjZSBmaWxlcy4gSWYgbnVsbCwgcmVzb3VyY2VVcmwgbXVzdCBiZSBzcGVjaWZpZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gb3V0RGlyIERpcmVjdG9yeSB3aGVyZSB0aGUgc291cmNlIGZpbGVzIHNob3VsZCBiZSBzdG9yZWQgaW50by5cbiAqIEBwYXJhbSB7UmVzb3VyY2VUeXBlfSByZXNvdXJjZVR5cGUgT3B0aW9uYWwgdHlwZSBkZXNjcmliaW5nIHdoZXRoZXIgdGhlIHJlc291cmNlVXJsIHJlZmVyZW5jZXMgYSBKYXZhc2NyaXB0IG9yIGEgU291cmNlIE1hcCBmaWxlLiBBdXRvbWF0aWMgZGV0ZWN0aW9uIChhY2NvcmRpbmcgdG8gdGhlIGZpbGUgbmFtZSBleHRlbnNpb25zKSBpcyBhdHRlbXB0ZWQgaWYgbm90IHNwZWNpZmllZC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBzcmNJbmNsdWRlIE9wdGlvbmFsIHBhdHRlcm4gdG8gdGVzdCBhIHNvdXJjZSBjb2RlIHBhdGggYWdhaW5zdCBiZWZvcmUgc2VuZGluZyBpdCB0byB0aGUgcmVjZWl2ZXIuIERlZmF1bHRzIHRvIC4qXG4gKiBAcGFyYW0ge1JlZ0V4cH0gc3JjRXhjbHVkZSBPcHRpb25hbCBwYXR0ZXJuIHRvIHRlc3QgYSBzb3VyY2UgY29kZSBwYXRoIGFnYWluc3QgdG8gZXhjbHVkZSBmcm9tIHNlbmRpbmcgaXQgdG8gdGhlIHJlY2VpdmVyLiBFeGNsdWRlIHBhdHRlcm4gaXMgdGVzdGVkIGFmdGVyIHRoZSBpbmNsdWRlIHBhdHRlcm4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gQXN5bmMgZnVuY3Rpb24gd2l0aG91dCBhIGRpcmVjdCByZXN1bHQgKHVzZSByZWNlaXZlciB0byByZWNlaXZlIGluZm9ybWF0aW9uKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFNyY1RvRGlyKHJlc291cmNlVXJsOiBVUkwgfCBudWxsLCBzb3VyY2VNYXA6IHN0cmluZyB8IG51bGwsIG91dERpcj86IHN0cmluZywgcmVzb3VyY2VUeXBlPzogUmVzb3VyY2VUeXBlLCBzcmNJbmNsdWRlPzogUmVnRXhwLCBzcmNFeGNsdWRlPzogUmVnRXhwKSB7XG4gICAgbGV0IGJhc2VEaXI6IHN0cmluZyA9IF9fZGlybmFtZSArIHBhdGguc2VwICsgJ2V4dHJhY3QnO1xuICAgIGlmIChvdXREaXIpIHtcbiAgICAgICAgYmFzZURpciA9IG91dERpcjtcbiAgICB9XG5cbiAgICByZXR1cm4gZXh0cmFjdFNyYyhyZXNvdXJjZVVybCwgbnVsbCwocGF0aCwgc291cmNlTmFtZSwgc291cmNlKSA9PiB7XG4gICAgICAgIG1rZGlyUGF0aFN5bmMoYmFzZURpciArIHBhdGgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG91dERpciArIHBhdGggKyBzb3VyY2VOYW1lLCBzb3VyY2UpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcih1dGlsLmZvcm1hdChcIlByb2JsZW0gd2hpbGUgd3JpdGluZyBmaWxlICVzOiAlc1wiLCBvdXREaXIgKyBwYXRoICsgc291cmNlTmFtZSwgZXJyb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUuaW5mbyh1dGlsLmZvcm1hdChcIlNvdXJjZSAlcyB3cml0dGVuXCIsIG91dERpciArIHBhdGggKyBzb3VyY2VOYW1lKSk7XG4gICAgfSwgcmVzb3VyY2VUeXBlLCBzcmNJbmNsdWRlLCBzcmNFeGNsdWRlKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHNvdXJjZSBjb2RlIGZyb20gZWl0aGVyIGEgcHJvdmlkZWQgSmF2YXNjcmlwdCBmaWxlIGNvbnRhaW5pbmcgYSBzb3VyY2UgbWFwIGluZm9ybWF0aW9uLCBhIFNvdXJjZSBNYXAgZmlsZSBvciBhIHNvdXJjZSBtYXAgaW4gc3RyaW5nIGZvcm0uXG4gKiBTb3VyY2UgY29kZSBmaWxlcyBtdXN0IGVpdGhlciBiZSByZWZlcmVuY2VkIGFuZCBhY2Nlc3NpYmxlIHZpYSBpbmZvcm1hdGlvbiBpbiB0aGUgc291cmNlIG1hcCBvciBiZSBjb250YWluZWQgaW4gdGhlIHNvdXJjZSBtYXAgKGVtYmVkZGVkKS5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBganNcbiAqIGNvbnN0IGJhc2VEaXIgPSBfX2Rpcm5hbWUgKyBcIi8uLi9yZXNvdXJjZXNcIjtcbiAqIGV4dHJhY3RTcmMobmV3IFVSTCh1dGlsLmZvcm1hdCgnZmlsZTovLyVzL2VtYmVkZGVkLXNvdXJjZW1hcC10ZXN0LmpzJywgYmFzZURpcikpLCBudWxsLCAocGF0aDogc3RyaW5nLCBzb3VyY2VOYW1lOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICogICBjb25zb2xlLmxvZyhcIlBhdGg6IFwiICsgcGF0aCk7ICAgICAgICAgICAgICAvLyAnL3NyYydcbiAqICAgY29uc29sZS5sb2coXCJTb3VyY2VOYW1lOiBcIiArIHNvdXJjZU5hbWUpOyAgLy8gJy9lbWJlZGRlZC1zb3VyY2VtYXAtdGVzdC50cydcbiAqICAgY29uc29sZS5sb2coXCJTb3VyY2U6IFwiICsgc291cmNlKTsgICAgICAgICAgLy8gJ2NvbnNvbGUubG9nKFxcJ0hlbGxvIFdvcmxkIVxcJyk7J1xuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBOb3RlOiBFaXRoZXIgcmVzb3VyY2VVcmwgb3Igc291cmNlTWFwIG11c3QgYmUgc3BlY2lmaWVkLlxuICpcbiAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkwgfCBudWxsfSByZXNvdXJjZVVybCBBbiB1cmwgKGh0dHAocyk6Ly8gb3IgZmlsZTovLyBmb3IgbG9jYWwgZmlsZSBhY2Nlc3MpIHRvIHJldHJpZXZlIGVpdGhlciBhIEphdmFzY3JpcHQgZmlsZSBvciBhIFNvdXJjZSBNYXAgZmlsZS4gSWYgbnVsbCwgc291cmNlTWFwIG11c3QgYmUgc3BlY2lmaWVkLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsfSBzb3VyY2VNYXAgU291cmNlIE1hcCBKU09OIGluIHN0cmluZyBmb3JtIHRvIHVzZSBkaXJlY3RseS4gTXVzdCBjb250YWluIHNvdXJjZSBjb2RlIG9yIHJlZmVyIHdpdGggYWJzb2x1dGUgdXJscyB0byBzb3VyY2UgZmlsZXMuIElmIG51bGwsIHJlc291cmNlVXJsIG11c3QgYmUgc3BlY2lmaWVkLlxuICogQHBhcmFtIHsocGF0aDogc3RyaW5nLCBzb3VyY2VOYW1lOiBzdHJpbmcsIHNvdXJjZTogKHN0cmluZyB8IG51bGwpKSA9PiB2b2lkfSByZWNlaXZlciBBIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBmb3IgZWFjaCBzb3VyY2UgZmlsZSByZWZlcmVuY2VkIGluIHRoZSBzb3VyY2UgbWFwLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQYXRoIGlzIHRoZSBiYXNlIHBhdGggb2YgdGhlIHNvdXJjZSBmaWxlLCBzb3VyY2VOYW1lIHRoZSBmaWxlIG5hbWUsIHNvdXJjZSB0aGUgc291cmNlIGNvZGUsIGlmIHRoZSBmaWxlIHdhcyBmb3VuZFxuICogQHBhcmFtIHtSZXNvdXJjZVR5cGV9IHJlc291cmNlVHlwZSBPcHRpb25hbCB0eXBlIGRlc2NyaWJpbmcgd2hldGhlciB0aGUgcmVzb3VyY2VVcmwgcmVmZXJlbmNlcyBhIEphdmFzY3JpcHQgb3IgYSBTb3VyY2UgTWFwIGZpbGUuIEF1dG9tYXRpYyBkZXRlY3Rpb24gKGFjY29yZGluZyB0byB0aGUgZmlsZSBuYW1lIGV4dGVuc2lvbnMpIGlzIGF0dGVtcHRlZCBpZiBub3Qgc3BlY2lmaWVkLlxuICogQHBhcmFtIHtSZWdFeHB9IHNyY0luY2x1ZGUgT3B0aW9uYWwgcGF0dGVybiB0byB0ZXN0IGEgc291cmNlIGNvZGUgcGF0aCBhZ2FpbnN0IGJlZm9yZSBzZW5kaW5nIGl0IHRvIHRoZSByZWNlaXZlci4gRGVmYXVsdHMgdG8gLipcbiAqIEBwYXJhbSB7UmVnRXhwfSBzcmNFeGNsdWRlIE9wdGlvbmFsIHBhdHRlcm4gdG8gdGVzdCBhIHNvdXJjZSBjb2RlIHBhdGggYWdhaW5zdCB0byBleGNsdWRlIGZyb20gc2VuZGluZyBpdCB0byB0aGUgcmVjZWl2ZXIuIEV4Y2x1ZGUgcGF0dGVybiBpcyB0ZXN0ZWQgYWZ0ZXIgdGhlIGluY2x1ZGUgcGF0dGVybi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBBc3luYyBmdW5jdGlvbiB3aXRob3V0IGEgZGlyZWN0IHJlc3VsdCAodXNlIHJlY2VpdmVyIHRvIHJlY2VpdmUgaW5mb3JtYXRpb24pXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRyYWN0U3JjKHJlc291cmNlVXJsOiBVUkwgfCBudWxsLCBzb3VyY2VNYXA6IHN0cmluZyB8IG51bGwsIHJlY2VpdmVyOiAocGF0aDogc3RyaW5nLCBzb3VyY2VOYW1lOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZCwgcmVzb3VyY2VUeXBlPzogUmVzb3VyY2VUeXBlLCBzcmNJbmNsdWRlPzogUmVnRXhwLCBzcmNFeGNsdWRlPzogUmVnRXhwKSB7XG4gICAgbGV0IHJhd01hcCA9IHNvdXJjZU1hcDtcbiAgICBpZiAoIXJhd01hcCkge1xuICAgICAgICBpZiAoIXJlc291cmNlVXJsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignTm8gb3IgaW52YWxpZCBzb3VyY2VNYXAgYW5kIG5vIG9yIGludmFsaWQgcmVzb3VyY2VVcmwgcHJvdmlkZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhd01hcCA9IGF3YWl0IGxvYWRNYXAocmVzb3VyY2VVcmwpO1xuICAgIH1cblxuICAgIGxldCBzcmNJbmNsdWRlRWZmOiBSZWdFeHA7XG4gICAgaWYgKHNyY0luY2x1ZGUpIHtcbiAgICAgICAgc3JjSW5jbHVkZUVmZiA9IHNyY0luY2x1ZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3JjSW5jbHVkZUVmZiA9IC8uKi87XG4gICAgfVxuXG5cbiAgICBhd2FpdCBTb3VyY2VNYXBDb25zdW1lci53aXRoKHJhd01hcCwgbnVsbCwgKGNvbnN1bWVyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyh1dGlsLmZvcm1hdChcIlNvdXJjZSBtYXAgcmVmZXJlbmNlcyAlZCBzb3VyY2UgZmlsZXNcIiwgY29uc3VtZXIuc291cmNlcy5sZW5ndGgpKTtcblxuICAgICAgICBjb25zdW1lci5zb3VyY2VzLmZvckVhY2goKHNvdXJjZVJlZikgPT4ge1xuICAgICAgICAgICAgaWYgKCFzcmNJbmNsdWRlRWZmLnRlc3Qoc291cmNlUmVmKSB8fCAoc3JjRXhjbHVkZSAmJiBzcmNFeGNsdWRlLnRlc3Qoc291cmNlUmVmKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZVJlZlVybCA9IHVybC5wYXJzZShzb3VyY2VSZWYpO1xuICAgICAgICAgICAgbGV0IHBhdGhOYW1lID0gc291cmNlUmVmVXJsLnBhdGhuYW1lICsgKHNvdXJjZVJlZlVybC5xdWVyeSA/IHNvdXJjZVJlZlVybC5xdWVyeSA6ICcnKSArIChzb3VyY2VSZWZVcmwuaGFzaCA/IHNvdXJjZVJlZlVybC5oYXNoIDogJycpO1xuICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gcGF0aE5hbWU7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBjb25zdW1lci5zb3VyY2VDb250ZW50Rm9yKHNvdXJjZVJlZiwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAocGF0aE5hbWUubGFzdEluZGV4T2YocGF0aC5zZXApICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBwYXRoTmFtZS5zdWJzdHJpbmcocGF0aE5hbWUubGFzdEluZGV4T2YocGF0aC5zZXApKTtcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGhOYW1lLnN1YnN0cmluZygwLCBwYXRoTmFtZS5sYXN0SW5kZXhPZihwYXRoLnNlcCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gZHJvcCBhbnkgbGVhZGluZyByZWxhdGl2ZSBwYXRoIGNvbnN0cnVjdHNcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGhOYW1lLnJlcGxhY2UoL1tcXFxcXSsvZywgJy8nKTtcbiAgICAgICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGguc2VwICsgcGF0aE5hbWUucmVwbGFjZSgvXlsuL10rLywgJycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIHNha2Ugb2YgY29uc2lzdGVuY3kgd2l0aCBhYnNvbHV0ZSBwYXRoIGNhc2VzLCB3ZSBlbXB0eSBwYXRoIGFuZCBhcHBlbmQgYSBzbGFzaCBvbiBmaWxlTmFtZVxuICAgICAgICAgICAgICAgIHBhdGhOYW1lID0gJyc7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWUgPSAnLycgKyBmaWxlTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVjZWl2ZXIocGF0aE5hbWUsIGZpbGVOYW1lLCBzb3VyY2UpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0cy5SZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGU7XG5leHBvcnRzLmV4dHJhY3RTcmNUb0RpciA9IGV4dHJhY3RTcmNUb0RpcjtcbmV4cG9ydHMuZXh0cmFjdFNyYyA9IGV4dHJhY3RTcmM7XG4iXX0=