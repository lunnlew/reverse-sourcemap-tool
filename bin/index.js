#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const usage = require('../lib/usage');
const reverse = require('../lib/reverse');

reverse.exec(usage.optsParser(process.argv, usage.parsePackageInfo()));

console.log("reverse completed");
