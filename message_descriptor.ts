import { ObservableArray } from "./observable_array";

export interface EnumValue {
  name: string;
  value: number;
}

export interface EnumDescriptor<T> {
  name: string;
  enumValues?: EnumValue[];
}

export enum PrimitiveType {
  NUMBER = 1,
  BOOLEAN = 2,
  STRING = 3,
}

export interface MessageField {
  name: string;
  primitiveType?: PrimitiveType;
  enumDescriptor?: EnumDescriptor<any>;
  messageDescriptor?: MessageDescriptor<any>;
  arrayFactoryFn?: () => Array<any>;
  observableArrayFactoryFn?: () => ObservableArray<any>;
}

export interface MessageDescriptor<T> {
  name: string;
  factoryFn?: () => T;
  messageFields?: MessageField[];
}
