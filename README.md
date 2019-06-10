# reverse-sourcemap-tool

> Reverse engineering JavaScript and CSS sources from sourcemaps


## Getting started

Install the `reverse-sourcemap-tool` command line utility globally with [npm](https://www.npmjs.com/).
Elevated privileges might be needed via `sudo`, depending on the platform. In most cases just:

```sh
npm i -g reverse-sourcemap-tool
```

## Command line options

The output of `reverse-sourcemap-tool --help` pretty much covers all the options:

```sh
Usage: reverse-sourcemap-tool [options] <file|directory>

  -h, --help               Help and usage instructions
  -V, --version            Version number
  -v, --verbose            Verbose output, will print which file is currently being processed
  -o, --output-dir String  Output directory - default: .
  -M, --match String       Regular expression for matching and filtering files - default: \.(map|js|css)$
  -r, --recursive          Recursively search matching files

Version 1.0.9
```
