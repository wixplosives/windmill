#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

if (fs.existsSync(path.join(__dirname, '../cjs/cli'))) {
    require('../cjs/cli');
} else {
    require('tsconfig-paths/register');
    require('@ts-tools/node/r');
    require('../src/cli');
}
