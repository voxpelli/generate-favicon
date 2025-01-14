# @voxpelli/generate-favicon

CLI for generating favicons from SVG source

[![npm version](https://img.shields.io/npm/v/@voxpelli/generate-favicon.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/generate-favicon)
[![npm downloads](https://img.shields.io/npm/dm/@voxpelli/generate-favicon.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/generate-favicon)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-7fffff?style=flat&labelColor=ff80ff)](https://github.com/neostandard/neostandard)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

## Install

### Globally

```sh
npm install -g @voxpelli/generate-favicon
```

### Locally

```sh
npm install -D @voxpelli/generate-favicon
```

## Options

```
  Usage
    $ generate-favicon example.svg

  Output options
    --default   Use default best practice favicon output
    --ico   -i  Whether to output a .ico file (in a standard size)
    --size  -s  The sizes to output PNG files for with optional custom name set with a suffix using a ":" as a separator

  Options
    --dry-run   Runs without saving anything
    --help      Prints this help and exits
    --name  -n  Custom name to use for output
    --silent    Use to silent any text output
    --version   Prints current version and exits

  Examples
    $ generate-favicon --size 120 --size 240 --ico favicon.svg
    $ generate-favicon --name favicon example.svg
```

## See also

- This tool is inspired and based on the excellent [How to Favicon in 2024: Three files that fit most needs](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)
