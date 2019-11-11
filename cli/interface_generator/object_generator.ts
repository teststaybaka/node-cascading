import { newInternalError } from '../../errors';
import { GeneratedContent } from './generated_content';

let PRIMITIVE_TYPES = new Set(['boolean', 'number', 'string']);

interface ObjectField {
  name: string,
  type: string,
  importFrom?: string,
}

export interface ObjectDescriptor {
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

export function validateObjectDescriptor(obj: any): void {
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

export function generateFromObjectDescriptor(descriptor: ObjectDescriptor): GeneratedContent {
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
