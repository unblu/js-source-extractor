#!/usr/bin/env node

/*
 * js-source-extractor
 * Copyright(c) 2018 Kay Huber
 * ISC Licensed
 */

import { SourceMapConsumer} from 'source-map';
import * as httpsClient from 'https';
import * as httpClient from 'http';
import * as util from 'util';
import {URL} from "url";
import * as http from "http";
import {readFileSync} from "fs";
import fs from 'fs';
import path from 'path';
import url from 'url';
import mime from 'mime';

/* ********************** */
/* utilities              */
/* ********************** */


function mkdirPathSync(targetDir: string) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = '.';

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }

        return curDir;
    }, initDir);
}

function loadResource(resourceUrl: URL): Promise<string> {
    console.info(util.format("Reading contents of %s", resourceUrl));
    return new Promise<string>((resolve, reject) => {
        let httpFn = (res: http.IncomingMessage) => {
            let responseBody = "";
            res.on("data", (chunk) => {
                responseBody += chunk;
            });
            res.on("end", () => {
                console.debug("source map response complete");
                resolve(responseBody);
            });
        };

        if (resourceUrl.protocol === 'https:') {
            httpsClient.request(resourceUrl, httpFn).end();
        } else if (resourceUrl.protocol === 'http:') {
            httpClient.request(resourceUrl, httpFn).end();
        } else if (resourceUrl.protocol === 'file:') {
            try {
                const result = readFileSync(resourceUrl).toString('UTF-8');
                resolve(result);
            } catch (error) {
                console.error(util.format('Problem reading %s: %s', resourceUrl, error));
                reject(error);
            }
        }
    });
}

async function loadMap(resourceUrl: URL, resourceType?: ResourceType): Promise<string> {
    console.info(util.format("Loading resource %s to examine (expecting javascript or source map)", resourceUrl));

    if (!resourceType) {
        const guessedType = mime.getType(resourceUrl.pathname);
        if (guessedType === 'application/javascript') {
            resourceType = ResourceType.JAVASCRIPT;
        } else if (guessedType === 'application/json') {
            resourceType = ResourceType.SOURCE_MAP;
        } else {
            throw Error(util.format('No resource type specified and the guessed one \'%s\' is unrecognized.', guessedType));
        }
    }

    console.info(util.format('Resource will be treated as a %s', resourceType.valueOf()));
    let resourceContent = await loadResource(resourceUrl);

    if (resourceType === ResourceType.JAVASCRIPT) {
        const sourceMapPrefix = ['//@ sourceMappingURL=', '//# sourceMappingURL='];

        let mapUrlIndex = -1;
        sourceMapPrefix.some((prefix) => {
            mapUrlIndex = resourceContent.indexOf(prefix);
            return mapUrlIndex !== -1;
        });

        // locate //@ sourceMappingURL= and examine the string afterwards
        if (mapUrlIndex === -1) {
            throw Error('No embedded source map url has been found. Is the source map in a separate file?');
        }

        console.info('Found source map url');

        const mapUrl = resourceContent.substring(mapUrlIndex + '//@ sourceMappingURL='.length);
        if (mapUrl.startsWith('data:application/json;base64,')) {
            console.info('Extracting embedded source map');

            // map url is not a map url but directly the map contents
            const buf = Buffer.from(mapUrl.substring('data:application/json;base64,'.length), "base64");
            resourceContent = buf.toString('UTF-8');
        } else {
            // load source map from url
            console.info("Found source map url inside javascript file.");
            resourceContent = await loadResource(new URL(mapUrl, resourceUrl));
        }
    }

    return resourceContent;
}

/* ********************** */
/* main exported functionalities */
/* ********************** */

/**
 * Type of resource. Required if not automatically determinable.
 */
export enum ResourceType {
    JAVASCRIPT = 'Javascript',
    SOURCE_MAP = 'Source Map'
}

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
export async function extractSrcToDir(resourceUrl: URL | null, sourceMap: string | null, outDir?: string, resourceType?: ResourceType, srcInclude?: RegExp, srcExclude?: RegExp) {
    let baseDir: string = __dirname + path.sep + 'extract';
    if (outDir) {
        baseDir = outDir;
    }

    return extractSrc(resourceUrl, null,(path, sourceName, source) => {
        mkdirPathSync(baseDir + path);

        try {
            fs.writeFileSync(outDir + path + sourceName, source);
        } catch (error) {
            console.error(util.format("Problem while writing file %s: %s", outDir + path + sourceName, error));
        }

        console.info(util.format("Source %s written", outDir + path + sourceName));
    }, resourceType, srcInclude, srcExclude);
}

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
export async function extractSrc(resourceUrl: URL | null, sourceMap: string | null, receiver: (path: string, sourceName: string, source: string | null) => void, resourceType?: ResourceType, srcInclude?: RegExp, srcExclude?: RegExp) {
    let rawMap = sourceMap;
    if (!rawMap) {
        if (!resourceUrl) {
            throw Error('No or invalid sourceMap and no or invalid resourceUrl provided');
        }

        rawMap = await loadMap(resourceUrl);
    }

    let srcIncludeEff: RegExp;
    if (srcInclude) {
        srcIncludeEff = srcInclude;
    } else {
        srcIncludeEff = /.*/;
    }


    await SourceMapConsumer.with(rawMap, null, (consumer) => {
        console.info(util.format("Source map references %d source files", consumer.sources.length));

        consumer.sources.forEach((sourceRef) => {
            if (!srcIncludeEff.test(sourceRef) || (srcExclude && srcExclude.test(sourceRef))) {
                return;
            }

            const sourceRefUrl = url.parse(sourceRef);
            let pathName = sourceRefUrl.pathname + (sourceRefUrl.query ? sourceRefUrl.query : '') + (sourceRefUrl.hash ? sourceRefUrl.hash : '');
            let fileName = pathName;
            const source = consumer.sourceContentFor(sourceRef, true);
            if (pathName.lastIndexOf(path.sep) != -1) {
                fileName = pathName.substring(pathName.lastIndexOf(path.sep));
                pathName = pathName.substring(0, pathName.lastIndexOf(path.sep));

                // drop any leading relative path constructs
                pathName = pathName.replace(/[\\]+/g, '/');
                pathName = path.sep + pathName.replace(/^[./]+/, '');
            } else {
                // for the sake of consistency with absolute path cases, we empty path and append a slash on fileName
                pathName = '';
                fileName = '/' + fileName;
            }

            receiver(pathName, fileName, source);
        });
    });
}

/* ********************** */
/* exports                */
/* ********************** */
exports.ResourceType = ResourceType;
exports.extractSrcToDir = extractSrcToDir;
exports.extractSrc = extractSrc;

/* ********************** */
/* command line           */
/* ********************** */

interface Options {
    outDir: string;
    includePattern?: string;
    excludePattern?: string;
}

/**
 * Command line interface - wrapped in a function for better testability
 *
 * ```js
 * process.exit(cli(process.argv));
 * ```
 * @param {string[]} args command line arguments
 * @returns {number} non-zero numbers indicate an error
 */
export function cli(args: string[]): Promise<number> {
    let packageJSON;
    try {
        const contents = fs.readFileSync('package.json').toString('utf-8');
        packageJSON = JSON.parse(contents);
    } catch (error) {
        // ignore for now - no version to specify in this case
    }

    const program = require('commander');

    if (packageJSON && packageJSON.version) {
        program.version(packageJSON.version);
        program.description(packageJSON.description);
    }

    return new Promise<number>((resolve, reject) => {
        let resourceUrlPresent = false;
        program
            .arguments('<resourceUrl>')
            .option('-o --outDir <outDir>', 'Base output directory where source files should be output to')
            .option('-i --include <includePattern>', 'Include pattern to apply when selecting source files for extraction')
            .option('-e --exclude <excludePattern>', 'Exclude pattern to apply when selecting source files for extraction (executed after include pattern)')
            .action((resourceUrl: string, options: Options) => {
                console.log(resourceUrl);
                resourceUrlPresent = true;
                let realResourceUrl;
                try {
                    realResourceUrl = new URL(resourceUrl);
                } catch (error) {
                    reject(new Error("Invalid resourceUrl provided: " + error));
                    return;
                }

                extractSrcToDir(realResourceUrl, null, options.outDir, undefined, options.includePattern ? new RegExp(options.includePattern) : undefined, options.excludePattern ? new RegExp(options.excludePattern) : undefined).then(() => resolve(0));
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

// are we "required/imported" or called from command line?
if (require.main === module) {
    cli(process.argv)
        .then((result) => {
            process.exit(result)
        })
        .catch((error) => {
            process.exit(1);
        });
}

