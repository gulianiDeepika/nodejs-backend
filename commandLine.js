#! /usr/bin/env node

const { program } = require('commander');
const search = require('./search');

program
    .command('search')
    .description('search commits')
    .action(search);

program.parse()