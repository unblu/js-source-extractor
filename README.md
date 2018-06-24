# JS Source Extractor

An extractor of source code from Javascript libraries containing source maps with embedded or referenced source.

[![Build Status](https://travis-ci.org/unblu/js-source-extractor.svg?branch=master)](https://travis-ci.org/unblu/js-source-extractor)
[![NPM version](https://badge.fury.io/js/js-source-extractor.svg)](https://npmjs.org/package/js-source-extractor)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Install for Node


```bash
$ npm install --save-dev js-source-extractor
```

#### CLI

You can call js-source-extractor directly from the command line

```bash
$ ./dist/js-source-extractor.js ----help
                                  
Usage: js-source-extractor [options] <resourceUrl>
                                  
Extracts source from javascript frameworks with sourcemap information (containing the source)
                                  
Options:
                                  
  -V, --version  output the version number
  -o --outDir    Base output directory where source files should be output to
  -i --include   Include pattern to apply when selecting source files for extraction
  -e --exclude   Exclude pattern to apply when selecting source files for extraction (executed after include pattern)
  -h, --help     output usage information
```

To extract a test javascript containing a source map with source code embedded, use
```bash
$ ./dist/js-source-extractor.js file://$(pwd)/resources/embedded-sourcemap-test.js --outDir /tmp/js-source-extractor-test
file:///.../resources/embedded-sourcemap-test.js
Loading resource file:///.../resources/embedded-sourcemap-test.js to examine (expecting javascript or source map)
Resource will be treated as a Javascript
Reading contents of file:///.../resources/embedded-sourcemap-test.js
Found source map url
Extracting embedded source map
Source map references 1 source files
Source /tmp/js-source-extractor-test/src/embedded-sourcemap-test.ts written
```

Source file is extracted to `--outDir`, in the above case `/tmp/js-source-extractor-test/src/embedded-sourcemap-test.ts`

#### Use as a module

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
