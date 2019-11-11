import { newInternalError } from '../../errors';
import { GeneratedContent } from './generated_content';

interface EnumValue {
  name: string,
  value: number,
}

export interface EnumDescriptor {
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

export function validateEnumDescriptor(obj: any): void {
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

export function generateFromEnumDescriptor(descriptor: EnumDescriptor): GeneratedContent {
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
