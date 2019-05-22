#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const usage = require('../lib/usage');
const reverse = require('../lib/reverse');

let opts = usage.optsParser(process.argv, usage.parsePackageInfo());
reverse.output(reverse.collectFilesList(opts),opts);
console.log("reverse completed");
