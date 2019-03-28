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

Help output from the CLI
```bash
$ js-source-extractor.js --help
  
    Usage: js-source-extractor [options] <resourceUrl>
  
    Extracts source from javascript frameworks with sourcemap information (containing the source)
  
    Options:
  
      -v, --version                   output the version number
      -o, --outDir <outDir>           Base output directory where source files should be output to
      -i, --include <includePattern>  Include pattern to apply when selecting source files for extraction
      -e, --exclude <excludePattern>  Exclude pattern to apply when selecting source files for extraction (executed after include pattern)
      -h, --help                      output usage information
```

## Install as node module to use in your own project

```bash
$ npm install --save-dev js-source-extractor
```

To extract source code from a sourcemap embedded in a javascript and call a callback per source file, use:

```typescript
import { URL } from "url";
import { extractSrc } from 'js-source-extractor'

extractSrc(new URL('https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js'), null, (path: string, sourceName: string, source: string | null) => {
    console.log("Path: " + path);              // '/src'
    console.log("SourceName: " + sourceName);  // '/embedded-sourcemap-test.ts'
    console.log("Source: " + source);          // 'console.log(\'Hello World!\');'
});
```

To extract code from a sourcemap embedded in a javascript and write the source files to the disk, use:
```typescript
import { tmpdir } from "os";
import { URL } from "url";
import { extractSrcToDir } from 'js-source-extractor'

const outDir = tmpdir() + '/js-source-extractor-test'; // directory to store source files in
await extractSrcToDir(new URL('https://raw.githubusercontent.com/unblu/js-source-extractor/master/resources/embedded-sourcemap-test.js'), null, outDir);
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

This project is licensed under the ISC License

Copyright (c) 2018, Kay Huber, unblu inc.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Acknowledgments

* Thanks Dave for your encouragement to create this tiny tool
