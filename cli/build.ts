import fs = require('fs');
import path = require('path');
import { generateFromFile } from './interface_generator/interface_generator';
import { execSync } from 'child_process';

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

export function buildAllFiles(): void {
  buildDir('.');
  let output = execSync('tsc');
  console.log(output.toString());
}
