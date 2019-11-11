import { newInternalError } from '../errors';
import { extendSet } from '../common';

interface GeneratedContent {
  imports?: Map<string, Set<string>>,
  content: string,
  footer?: string,
}

let PRIMITIVE_TYPES = new Set(['boolean', 'number', 'string']);

interface ObjectField {
  name: string,
  type: string,
  importFrom?: string,
}

interface ObjectDescriptor {
  name: string,
  fields: ObjectField[],
}

function validateObjectField(obj: any): void {
  if (!obj || typeof obj !== 'object') {
    throw newInternalError('Not an object.');
  }
  if (typeof obj.name !== 'string') {
    throw newInternalError('"name" is not a string.');
  }
  if (typeof obj.type !== 'string') {
    throw newInternalError('"type" is not a string.');
  }
  if (!PRIMITIVE_TYPES.has(obj.type) && typeof obj.importFrom !== 'string') {
    throw newInternalError('"importFrom" is not a string.');
  }
}

function validateObjectDescriptor(obj: any): void {
  if (!obj || typeof obj !== 'object') {
    throw newInternalError('Not an object.');
  }
  if (typeof obj.name !== 'string') {
    throw newInternalError('"name" is not a string.');
  }
  if (!(obj.fields instanceof Array)) {
    throw newInternalError('"fields" is not an Array.');
  }
  for (let i = 0; i < obj.fields.length; i++) {
    let field = obj.fields[i];
    try {
      validateObjectField(field);
    } catch (e) {
      throw newInternalError(`Failed to validate the ${i}th field.`, e);
    }
  }
}

function generateObjectInterface(fields: ObjectField[]): string {
  let content = '';
  for (let field of fields) {
    content += `  ${field.name}?: ${field.type},\n`
  }
  return content;
}

function generateObjectConstructFunction(fields: ObjectField[]): string {
  let content = '';
  for (let field of fields) {
    if (PRIMITIVE_TYPES.has(field.type)) {
      content += `  if (typeof obj.${field.name} === '${field.type}') {
    ret.${field.name} = obj.${field.name};
  }
`;
    } else {
      content += `  ret.${field.name} = construct${field.type}(obj.${field.name});\n`
    }
  }
  return content;
}

function generateFromObjectDescriptor(descriptor: ObjectDescriptor): GeneratedContent {
  let content = `
export interface ${descriptor.name} {
${generateObjectInterface(descriptor.fields)}}

export function construct${descriptor.name}(obj?: any): ${descriptor.name}|undefined {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  let ret: ${descriptor.name} = {};
${generateObjectConstructFunction(descriptor.fields)}}
`;

  let imports = new Map<string, Set<string>>();
  for (let field of descriptor.fields) {
    if (!PRIMITIVE_TYPES.has(field.type)) {
      if (!imports.has(field.importFrom)) {
        imports.set(field.importFrom, new Set<string>());
      }
      let importsSet = imports.get(field.importFrom);
      importsSet.add(field.type);
      importsSet.add(`construct${field.type}`);
    }
  }

  return {
    imports: imports,
    content: content,
  };
}

interface EnumValue {
  name: string,
  value: number,
}

interface EnumDescriptor {
  name: string,
  values: EnumValue[],
}

function validateEnumValue(obj: any): void {
  if (!obj || typeof obj !== 'object') {
    throw newInternalError('Not an object');
  }
  if (typeof obj.name !== 'string') {
    throw newInternalError('"name" is not a string');
  }
  if (typeof obj.value !== 'number') {
    throw newInternalError('"value" is not a number.');
  }
}

function validateEnumDescriptor(obj: any): void {
  if (!obj || typeof obj !== 'object') {
    throw newInternalError('Not an object.');
  }
  if (typeof obj.name !== 'string') {
    throw newInternalError('"name" is not a string.');
  }
  if (!(obj.values instanceof Array)) {
    throw newInternalError('"Values" is not an Array.');
  }
  for (let i = 0; i < obj.values.length; i++) {
    let value = obj.values[i];
    try {
      validateEnumValue(value);
    } catch (e) {
      throw newInternalError(`Failed to validate the ${i}th value.`, e);
    }
  }
}

function generateEnumValues(values: EnumValue[]): string {
  let content = '';
  for (let value of values) {
    content += `  ${value.name} = ${value.value},\n`;
  }
  return content;
}

function generateFromEnumDescriptor(descriptor: EnumDescriptor): GeneratedContent {
  let content = `
export enum ${descriptor.name} {
${generateEnumValues(descriptor.values)}}

export function construct${descriptor.name}(num?: any): ${descriptor.name}|undefined {
  if (!num || typeof num !== 'number' || !(num in ${descriptor.name})) {
    return undefined;
  } else {
    return num;
  }
}
`;

  return {
    content: content,
  }
}

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

export function generateFromDescriptorList(obj: any): string {
  if (!(obj instanceof Array)) {
    throw newInternalError('Top level object is not an Array.');
  }

  let allGeneratedContent: GeneratedContent[] = [];
  for (let i = 0; i < obj.length; i++) {
    let subObj = obj[i];
    try {
      validateDescriptor(subObj);
    } catch (e) {
      throw newInternalError(`Failed to validate the ${i}th object.`, e);
    }
    allGeneratedContent.push(generateFromDescriptor(subObj));
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

  let fileContent = '';
  for (let iter = imports.entries(), result = iter.next(); !result.done; result = iter.next()) {
    let path = result.value[0];
    let names = result.value[1];
    let nameStr = Array.from(names).join(', ');
    fileContent += `import { ${nameStr} } from '${path}';\n`;
  }
  for (let generatedContent of allGeneratedContent) {
    fileContent += generatedContent.content;
  }
  for (let generatedContent of allGeneratedContent) {
    if (generatedContent.footer) {
      fileContent += generatedContent.footer;
    }
  }
  return fileContent;
}
