import { ObservableArray, ObservableNestedArray } from "./observable_array";

export enum NamedTypeKind {
  ENUM = 1,
  MESSAGE = 2,
}

export interface EnumValue {
  name: string;
  value: number;
}

export enum MessageFieldType {
  NUMBER = 1,
  BOOLEAN = 2,
  STRING = 3,
  NAMED_TYPE = 4,
}

export interface MessageField {
  name: string;
  type: MessageFieldType;
  namedTypeDescriptor?: NamedTypeDescriptor<any>;
  ArrayClazz?: new () =>
    | Array<any>
    | ObservableArray<any>
    | ObservableNestedArray<any>;
}

export interface NamedTypeDescriptor<T> {
  name: string;
  kind: NamedTypeKind;
  enumValues?: EnumValue[];
  Clazz?: new () => any;
  messageFields?: MessageField[];
}
