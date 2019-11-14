#!/usr/bin/env node
import { generateFromFile } from './interface_generator/interface_generator';

let filePath = process.argv[2];
generateFromFile(filePath);
