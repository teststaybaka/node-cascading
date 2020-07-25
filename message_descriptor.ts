export interface EnumValue {
  name: string;
  value: number;
}

export interface EnumDescriptorUntyped {
  name: string;
  enumValues: EnumValue[];
}

export interface EnumDescriptor<T> extends EnumDescriptorUntyped {}

export enum MessageFieldType {
  NUMBER = 1,
  BOOLEAN = 2,
  STRING = 3,
  ENUM = 4,
  MESSAGE = 5,
}

export interface MessageField {
  name: string;
  type: MessageFieldType;
  enumDescriptor?: EnumDescriptorUntyped;
  messageDescriptor?: MessageDescriptorUntyped;
  isArray?: boolean;
}

export interface MessageDescriptorUntyped {
  name: string;
  fields: MessageField[];
}

export interface MessageDescriptor<T> extends MessageDescriptorUntyped {}
