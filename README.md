# JS Source Extractor

An extractor of source code from Javascript libraries containing source maps with embedded or referenced source.

[![Build Status](https://travis-ci.org/unblu/js-source-extractor.svg?branch=master)](https://travis-ci.org/unblu/js-source-extractor)
[![NPM version](https://badge.fury.io/js/js-source-extractor.svg)](https://npmjs.org/package/js-source-extractor)


## Install for CLI use

```bash
$ npm install -g js-source-extractor
```

Example CLI use
```bash
$ cd /tmp
$ js-source-extractor https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js
Loading resource https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js to examine (expecting javascript or source map)
Resource will be treated as a Javascript
Reading contents of https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js
source map response complete
Found source map url
Extracting embedded source map
Source map references 1 source files
Source /tmp/extract/src/embedded-sourcemap-test.ts written
```

To extract files to a specific folder, use `--outDir` like:
```bash
$ js-source-extractor https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js --outDir /tmp/extract
Loading resource https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js to examine (expecting javascript or source map)
Resource will be treated as a Javascript
Reading contents of https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js
source map response complete
Found source map url
Extracting embedded source map
Source map references 1 source files
Source /tmp/extract/src/embedded-sourcemap-test.ts written
```

If you have a source map on your file system already, use `file://` protocol like:
```bash
$ cd /tmp
$ wget https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js
$ js-source-extractor file:///tmp/embedded-sourcemap-test.js 
  Loading resource file:///tmp/embedded-sourcemap-test.js to examine (expecting javascript or source map)
  Resource will be treated as a Javascript
  Reading contents of file:///tmp/embedded-sourcemap-test.js
  Found source map url
  Extracting embedded source map
  Source map references 1 source files
  Source /tmp/extract/src/embedded-sourcemap-test.ts written

```

## Install as node module to use in your own project

```bash
$ npm install --save-dev js-source-extractor
```

To extract source code from a sourcemap embedded in a javascript and call a callback per source file, use:

```typescript
import { extractSrc } from 'js-source-extractor'

const baseDir = __dirname + "/../resources";
extractSrc(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
    console.log("Path: " + path);              // '/src'
    console.log("SourceName: " + sourceName);  // '/embedded-sourcemap-test.ts'
    console.log("Source: " + source);          // 'console.log(\'Hello World!\');'
});
```

To extract code from a sourcemap embedded in a javascript and write the source files to the disk, use:
```typescript
const baseDir = __dirname + "/../resources";
const outDir = tmpdir() + path.sep + 'js-source-extractor-test'; // directory to store source files in
await extractSrcToDir(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), outDir);
```

## Running the tests

JS Source Extractor features a number of mocha tests to verify the various API functionalities.

To start the tests, use:
```
$ npm test

```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/unblu/js-source-extractor/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Kay Huber** - *Initial work* - [unblu inc.](https://github.com/unblu)

See also the list of [contributors](https://github.com/unblu/js-source-extractor/contributors) who participated in this project.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE) file for details

## Acknowledgments

* Thanks Dave for your encouragement to create this tiny tool
