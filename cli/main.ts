#!/usr/bin/env node
import { execSync } from 'child_process';
import { buildAllFiles } from './build';

let purpose = process.argv[2];
if (purpose === 'build') {
  buildAllFiles();
} else if (purpose === 'run') {
  buildAllFiles();
  let filePath = process.argv[3];
  let passAlongArgs = process.argv.slice(4);
  let output = execSync(`node ${filePath} ${passAlongArgs}`);
  console.log(output.toString());
}
