# JS Source Extractor

An extractor of source code from Javascript libraries containing source maps with embedded or referenced source.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Install for Node


```
$ npm install --save-dev js-source-extractor
```

To extract source code from a sourcemap embedded in a javascript and call a callback per source file, use:

```js
import { extractSrc } from './js-source-extractor'

const baseDir = __dirname + "/../resources";
extractSrc(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
    console.log("Path: " + path);              // '/src'
    console.log("SourceName: " + sourceName);  // '/embedded-sourcemap-test.ts'
    console.log("Source: " + source);          // 'console.log(\'Hello World!\');'
});
```

To extract code from a sourcemap embedded in a javascript and write the source files to the disk, use:
```js
const baseDir = __dirname + "/../resources";
const outDir = tmpdir() + path.sep + 'js-source-extractor-test'; // directory to store source files in
await extractSrcToDir(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), outDir);
```

## Running the tests

JS Source Extractor features a number of mocha tests to verify the various API functionalities.

To start the tests, use:
```
$ npm run test

```

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Kay Huber** - *Initial work* - [unblu inc.](https://github.com/unblu)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE) file for details

## Acknowledgments

* Thanks Dave for your encouragement to create this tiny tool
