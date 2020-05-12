#!/usr/bin/env node
import path = require('path');
import { buildAllFiles } from './build';
import { Formatter } from './formatter';
import { MessageGenerator } from './message_generator';
import { execSync } from 'child_process';
import 'source-map-support/register';

async function main(): Promise<void> {
  let purpose = process.argv[2];
  if (purpose === 'build') {
    await buildAllFiles();
  } else if (purpose === 'run') {
    await buildAllFiles();
    let pathObj = path.parse(process.argv[3]);
    pathObj.base = undefined;
    pathObj.ext = '.js';
    let passAlongArgs = process.argv.slice(4);
    let output = execSync(`node ${path.format(pathObj)} ${passAlongArgs}`);
    console.log(output.toString());
  } else if (purpose === 'fmt') {
    let pathObj = path.parse(process.argv[3]);
    pathObj.base = undefined;
    pathObj.ext = '.ts';
    new Formatter(path.format(pathObj)).format();
  } else if (purpose === 'msg') {
    let pathObj = path.parse(process.argv[3]);
    pathObj.base = undefined;
    pathObj.ext = '.ts';
    new MessageGenerator(path.format(pathObj)).generate();
    await buildAllFiles();
  } else {
    console.log(`Usage:
  selfage build
  selfage run <relative file path> <pass-through flags>
  selfage fmt <relative file path>
  selfage msg <relative file path>
  
  build: Compile all files.
  run: Compile and run the specified file with the rest of the flags passed through.
  fmt: Format the specified file.
  msg: Generate implementions of MessageSerializer for and overwrite the specified file, followed by compiling to verify the result.

  <relative file path>'s extension can be .js, .ts, a single ".", or no extension at all, but cannot be .d.ts. It will be transformed to ts or js file depending on the command.
  <pass-through flags> is the list of rest command line arguments which will be passed to the program being started as it is.`);
  }
}

main();

