import fs = require('fs');
import path = require('path');
import { extendSet } from '../../common';
import { newInternalError } from '../../errors';
import { ImportLine } from '../format';
import { EnumDescriptor, generateFromEnumDescriptor, validateEnumDescriptor } from './enum_generator';
import { GeneratedContent } from './generated_content';
import { ObjectDescriptor, generateFromObjectDescriptor, validateObjectDescriptor } from './object_generator';

interface Descriptor {
  object?: ObjectDescriptor,
  enum?: EnumDescriptor,
}

function validateDescriptor(obj: any): void {
  if (obj.object) {
    try {
      validateObjectDescriptor(obj.object);
    } catch (e) {
      throw newInternalError('Failed to validate an object descriptor.', e);
    }
  } else if (obj.enum) {
    try {
      validateEnumDescriptor(obj.enum);
    } catch (e) {
      throw newInternalError('Failed to validate an enum descriptor.', e);
    }
  } else {
    throw newInternalError('Not a valid descriptor.');
  }
}

function generateFromDescriptor(descriptor: Descriptor): GeneratedContent {
  if (descriptor.object) {
    return generateFromObjectDescriptor(descriptor.object);
  }
  if (descriptor.enum) {
    return generateFromEnumDescriptor(descriptor.enum);
  }
  throw newInternalError('Not a valid descriptor.');
}

export function generateFromFile(filePath: string): void {
  let content = fs.readFileSync(filePath);
  let descriptors = JSON.parse(content.toString());

  if (!(descriptors instanceof Array)) {
    throw newInternalError('Top level object is not an Array.');
  }

  let allGeneratedContent: GeneratedContent[] = [];
  for (let i = 0; i < descriptors.length; i++) {
    let descriptor = descriptors[i];
    try {
      validateDescriptor(descriptor);
    } catch (e) {
      throw newInternalError(`Failed to validate the ${i}th object.`, e);
    }
    allGeneratedContent.push(generateFromDescriptor(descriptor));
  }

  let imports = new Map<string, Set<string>>();
  for (let generatedContent of allGeneratedContent) {
    if (!generatedContent.imports) {
      continue;
    }

    for(let iter = generatedContent.imports.entries(), result = iter.next(); !result.done; result = iter.next()) {
      let path = result.value[0];
      let names = result.value[1];
      if (!imports.has(path)) {
        imports.set(path, new Set<string>());
      }
      let existingNames = imports.get(path);
      extendSet(existingNames, names);
    }
  }

  let importLines: ImportLine[] = [];
  for (let iter = imports.entries(), result = iter.next(); !result.done; result = iter.next()) {
    let path = result.value[0];
    let names = result.value[1];
    let nameStr = Array.from(names).sort().join(', ');
    importLines.push({
      declaration: nameStr,
      path: path,
    });
  }
  importLines.sort((a, b): number => {
    return a.path.localeCompare(b.path);
  });

  let fileContent = '';
  for (let importLine of importLines) {
    fileContent += `import { ${importLine.declaration} } from '${importLine.path}';\n`;
  }
  for (let generatedContent of allGeneratedContent) {
    fileContent += generatedContent.content;
  }
  for (let generatedContent of allGeneratedContent) {
    if (generatedContent.footer) {
      fileContent += generatedContent.footer;
    }
  }

  let dir = path.dirname(filePath);
  let ext = path.extname(filePath);
  let base = path.basename(filePath, ext);
  fs.writeFileSync(path.join(dir, base + '.ts'), fileContent);
}
