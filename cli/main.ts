import fs = require('fs');
import { generateFromDescriptorList } from './interface_generator/interface_generator';

let filePath = process.argv[2];
let content = fs.readFileSync(filePath + '.json');
let descriptors = JSON.parse(content.toString());
let generatedContent = generateFromDescriptorList(descriptors);
fs.writeFileSync(filePath + '.ts', generatedContent);
