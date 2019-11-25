import fs = require('fs');
import path = require('path');
import { generateFromFile } from './interface_generator/interface_generator';
import { exec } from 'child_process';

let BLACKLIST_DIRS = new Set(['node_modules', '.git']);

function buildDir(basePath: string): void {
  let items = fs.readdirSync(basePath);
  for (let item of items) {
    let fullPath = path.join(basePath, item);
    let stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      if (BLACKLIST_DIRS.has(item)) {
        continue;
      }

      buildDir(fullPath);
      continue;
    }

    let suffix = path.extname(item);
    if (suffix === '.itf') {
      generateFromFile(fullPath);
    }
  }
}

export async function buildAllFiles(): Promise<void> {
  buildDir('.');
  await new Promise<void>((resolve, reject): void => {
    let child = exec('tsc');
    child.stdout.on('data', (chunk): void => {
      console.log(chunk);
    });
    child.stderr.on('data', (chunk): void => {
      console.log(chunk);
    });
    child.on('close', () => {
      resolve();
    });
  });
}
