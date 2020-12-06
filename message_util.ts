import {
  EnumDescriptor,
  EnumValue,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./message_descriptor";

export function parseEnum<T>(raw: any, descriptor: EnumDescriptor<T>): any {
  let enumValueFound: EnumValue;
  if (typeof raw === "string") {
    enumValueFound = descriptor.enumValues.find((enumValue): boolean => {
      return enumValue.name === raw;
    });
  } else if (typeof raw === "number") {
    enumValueFound = descriptor.enumValues.find((enumValue): boolean => {
      return enumValue.value === raw;
    });
  }
  if (enumValueFound === undefined) {
    return undefined;
  } else {
    return enumValueFound.value;
  }
}

export function parseMessage<T>(
  raw: any,
  descriptor: MessageDescriptor<T>,
  outputMessage?: T
): T {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  let ret: any = outputMessage;
  if (!ret) {
    ret = descriptor.factoryFn();
  }
  for (let field of descriptor.messageFields) {
    if (!field.arrayFactoryFn && !field.observableArrayFactoryFn) {
      ret[field.name] = parseField(raw[field.name], field, ret[field.name]);
    } else if (!Array.isArray(raw[field.name])) {
      ret[field.name] = undefined;
    } else {
      let values = ret[field.name];
      let setter: (index: number, newValue: any) => void;
      let getter: (index: number) => any;
      if (field.arrayFactoryFn) {
        if (!values) {
          values = field.arrayFactoryFn();
        }
        setter = (index, newValue) => {
          values[index] = newValue;
        };
        getter = (index) => {
          return values[index];
        };
      } else {
        // field.observableArrayFactoryFn
        if (!values) {
          values = field.observableArrayFactoryFn();
        }
        setter = (index, newValue) => {
          values.set(index, newValue);
        };
        getter = (index) => {
          return values.get(index);
        };
      }
      ret[field.name] = values;
      for (let i = 0; i < raw[field.name].length; i++) {
        let element = raw[field.name][i];
        if (i < values.length) {
          setter(i, parseField(element, field, getter(i)));
        } else {
          values.push(parseField(element, field));
        }
      }
      for (let i = values.length; i > raw[field.name].length; i--) {
        values.pop();
      }
    }
  }
  return ret;
}

function parseField(
  rawField: any,
  field: MessageField,
  outputField?: any
): any {
  if (field.primitiveType) {
    if (field.primitiveType === PrimitiveType.NUMBER) {
      if (typeof rawField === "number") {
        return rawField;
      } else {
        return undefined;
      }
    } else if (field.primitiveType === PrimitiveType.BOOLEAN) {
      if (typeof rawField === "boolean") {
        return rawField;
      } else {
        return undefined;
      }
    } else if (field.primitiveType === PrimitiveType.STRING) {
      if (typeof rawField === "string") {
        return rawField;
      } else {
        return undefined;
      }
    }
  } else if (field.enumDescriptor) {
    return parseEnum(rawField, field.enumDescriptor);
  } else if (field.messageDescriptor) {
    return parseMessage(rawField, field.messageDescriptor, outputField);
  }
}
