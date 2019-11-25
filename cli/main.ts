#!/usr/bin/env node
import { buildAllFiles } from './build';
import { sortImports } from './format';
import { execSync } from 'child_process';


async function main(): Promise<void> {
  let purpose = process.argv[2];
  if (purpose === 'build') {
    await buildAllFiles();
  } else if (purpose === 'run') {
    await buildAllFiles();
    let filePath = process.argv[3];
    let passAlongArgs = process.argv.slice(4);
    let output = execSync(`node ${filePath} ${passAlongArgs}`);
    console.log(output.toString());
  } else if (purpose === 'fmt') {
    let filePath = process.argv[3];
    sortImports(filePath + '.ts');
  }
}

main();
