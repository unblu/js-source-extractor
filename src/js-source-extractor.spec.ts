import {cli, extractSrc, extractSrcToDir} from './js-source-extractor';
import * as chai from 'chai';
import {URL} from "url";
import chaiAsPromised from 'chai-as-promised';
import util from 'util';
import rimraf from 'rimraf';
import {tmpdir} from "os";
import path from 'path';
import {existsSync, readFileSync} from 'fs';
import clearModule from 'clear-module';

chai.use(chaiAsPromised);
const expect = chai.expect;

interface SourceMapInfo {
    path: string;
    sourceName: string;
    source: string | null;
}

const baseDir = __dirname + "/../resources";
const outDir = tmpdir() + path.sep + 'js-source-extractor-test';
const embeddedSourcemapTestUrl = new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir));
const externalSourcemapTestUrl = new URL(util.format('file://%s/external-sourcemap-test.js', baseDir));
const cleanup = (doResolve: boolean, arg: any) => {
    return new Promise((resolve, reject) => {
        console.info('cleaning up temp directory');
        rimraf(outDir, () => {
            if (doResolve) {
                resolve(arg);
            } else {
                reject(arg);
            }
        });
    });
};

describe('Command Line Interface CLI', () => {
    beforeEach(() => {
        clearModule('commander');
    });

    it('Without resource url', () => {
        return expect(cli(['/usr/bin/node', __dirname + '/js-source-extractor'])).to.eventually.be.rejected;
    });

    it('Sourcemap embedded in Javascript file', () => {
        return expect(cli(['/usr/bin/node', __dirname + '/js-source-extractor', embeddedSourcemapTestUrl.toString(), '--outDir', outDir])).to.eventually.be.fulfilled
            .then(() => {
                const outFileName = outDir + '/src/embedded-sourcemap-test.ts';
                expect(existsSync(outFileName), 'extracted source file exists').to.be.true;
                expect(readFileSync(outFileName).toString('utf-8'), 'source code').to.equal('console.log(\'Hello World!\');');
            })
            .then((result) => cleanup(true, result), (error) => cleanup(false, error));
    });
});

describe('Module import', () => {
    describe('#Test extraction of test code under \'resources\' folder', () => {
        it('Sourcemap embedded in Javascript file', async () => {
            const sources: Array<SourceMapInfo> = [];
            return expect(extractSrc(embeddedSourcemapTestUrl, null, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled
            .then(() => {
                expect(sources.length, 'number of source files found').to.equal(1);
                expect(sources[0].path, 'path of source file').to.equal('/src');
                expect(sources[0].sourceName, 'name of source file').to.equal('/embedded-sourcemap-test.ts');
                expect(sources[0].source, 'source code').to.equal('console.log(\'Hello World!\');');
            });
        });

        it('Sourcemap in external map file', async () => {
            const sources: Array<SourceMapInfo> = [];
            return expect(extractSrc(externalSourcemapTestUrl, null, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled
            .then(() => {
                expect(sources.length, 'number of source files found').to.equal(1);
                expect(sources[0].path, 'path of source file').to.equal('/src');
                expect(sources[0].sourceName, 'name of source file').to.equal('/external-sourcemap-test.ts');
                expect(sources[0].source, 'source code').to.equal('console.log(\'Hello World!\');');
            });
        });

        it('Invalid Javascript file', async () => {
            const baseDir = __dirname + "/../resources";
            return expect(extractSrc(new URL(util.format('file://%s/dummy.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
            })).to.eventually.be.rejected;
        });
    });

    describe('#Test extraction of test code under \'resources\' folder to file system', () => {
        it('Sourcemap embedded in Javascript file', async () => {
            return expect(extractSrcToDir(embeddedSourcemapTestUrl, null, outDir)).to.eventually.be.fulfilled
                .then(() => {
                    const outFileName = outDir + '/src/embedded-sourcemap-test.ts';
                    expect(existsSync(outFileName)).to.be.true;
                    expect(readFileSync(outFileName).toString('utf-8')).to.equal('console.log(\'Hello World!\');');
                })
                .then((result) => cleanup(true, result), (error) => cleanup(false, error));
        });
    });

    describe('#Test extraction of in memory source map', () => {
        it('Plain hello world', async () => {
            const plainSourceMap = '{"version":3,"file":"external-sourcemap-test.js","sourceRoot":"","sources":["../src/external-sourcemap-test.ts"],"names":[],"mappings":";AAAA,OAAO,CAAC,GAAG,CAAC,cAAc,CAAC,CAAC","sourcesContent":["console.log(\'Hello World!\');"]}';
            const sources: Array<SourceMapInfo> = [];
            return expect(extractSrc(null, plainSourceMap, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled
            .then(() => {
                expect(sources.length, 'number of source files found').to.equal(1);
                expect(sources[0].path, 'path of source file').to.equal('/src');
                expect(sources[0].sourceName, 'name of source file').to.equal('/external-sourcemap-test.ts');
                expect(sources[0].source, 'source code').to.equal('console.log(\'Hello World!\');');
            });
        });
    });

    describe('#Test extraction of public javascript lib', () => {
        it('jQuery', async () => {
            const sources: Array<SourceMapInfo> = [];
            return expect(extractSrc(new URL('https://code.jquery.com/jquery-3.3.1.min.map'), null, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled
            .then(() => {
                expect(sources.length, 'number of source files found').to.equal(1);
                expect(sources[0].path, 'path to source file').to.equal('');
                expect(sources[0].sourceName, 'name of source file').to.equal('/jquery-3.3.1.js');
                expect(sources[0].source, 'source code').is.null;
            });
        });
    });
});

