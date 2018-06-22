import {extractSrc, extractSrcToDir} from './js-source-extractor';
import * as chai from 'chai';
import {URL} from "url";
import chaiAsPromised from 'chai-as-promised';
import util from 'util';
import rimraf from 'rimraf';
import {tmpdir} from "os";
import path from 'path';

chai.use(chaiAsPromised);
const expect = chai.expect;

interface SourceMapInfo {
    path: string;
    sourceName: string;
    source: string | null;
}

describe('Command Line Interface CLI', () => {
    describe('#Test extraction of test code under \'resources\' folder', () => {
        it('Sourcemap embedded in Javascript file', async () => {
            const baseDir = __dirname + "/../resources";
            const sources: Array<SourceMapInfo> = [];
            await expect(extractSrc(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled;

            expect(sources.length).to.equal(1);
            expect(sources[0].path).to.equal('/src');
            expect(sources[0].sourceName).to.equal('/embedded-sourcemap-test.ts');
            expect(sources[0].source).to.equal('console.log(\'Hello World!\');');
        });

        it('Sourcemap in external map file', async () => {
            const baseDir = __dirname + "/../resources";
            const sources: Array<SourceMapInfo> = [];
            await expect(extractSrc(new URL(util.format('file://%s/external-sourcemap-test.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled;

            expect(sources.length).to.equal(1);
            expect(sources[0].path).to.equal('/src');
            expect(sources[0].sourceName).to.equal('/external-sourcemap-test.ts');
            expect(sources[0].source).to.equal('console.log(\'Hello World!\');');
        });
    });

    describe('#Test extraction of test code under \'resources\' folder to file system', () => {
        it('Sourcemap embedded in Javascript file', async () => {
            const baseDir = __dirname + "/../resources";
            const outDir = tmpdir() + path.sep + 'js-source-extractor-test';
            await expect(extractSrcToDir(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), outDir)).to.eventually.be.fulfilled;

            // XXX TODO check in file system whether files are as expected

            // remove test files
            return new Promise((resolve, reject) => {
                rimraf(outDir, () => {
                    resolve();
                });
            });
        });
    });

    describe('#Test extraction of in memory source map', () => {
        it('Plain hello world', async () => {
            const plainSourceMap = '{"version":3,"file":"external-sourcemap-test.js","sourceRoot":"","sources":["../src/external-sourcemap-test.ts"],"names":[],"mappings":";AAAA,OAAO,CAAC,GAAG,CAAC,cAAc,CAAC,CAAC","sourcesContent":["console.log(\'Hello World!\');"]}';
            const sources: Array<SourceMapInfo> = [];
            await expect(extractSrc(null, plainSourceMap, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled;

            expect(sources.length).to.equal(1);
            expect(sources[0].path).to.equal('/src');
            expect(sources[0].sourceName).to.equal('/external-sourcemap-test.ts');
            expect(sources[0].source).to.equal('console.log(\'Hello World!\');');
        });
    });

    describe('#Test extraction of public javascript lib', () => {
        it('jQuery', async () => {
            const sources: Array<SourceMapInfo> = [];
            await expect(extractSrc(new URL('https://code.jquery.com/jquery-3.3.1.min.map'), null, (path: string, sourceName: string, source: string | null) => {
                sources.push({'path': path, 'sourceName': sourceName, 'source': source});
            })).to.eventually.be.fulfilled;

            expect(sources.length).to.equal(1);
            expect(sources[0].path).to.equal('');
            expect(sources[0].sourceName).to.equal('/jquery-3.3.1.js');
            expect(sources[0].source).is.null;
        });
    });
});

