import {
  EnumDescriptor,
  EnumDescriptorUntyped,
  EnumValue,
  MessageDescriptor,
  MessageDescriptorUntyped,
  MessageFieldType,
} from "./message_descriptor";

export function parseEnum<T>(raw: any, descriptor: EnumDescriptor<T>): T {
  return parseEnumUntyped(raw, descriptor) as T;
}

export function parseEnumUntyped(
  raw: any,
  descriptor: EnumDescriptorUntyped
): any {
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

export function parseJsonString<T>(
  json: string,
  descriptor: MessageDescriptor<T>
): T {
  return parseJsonStringUntyped(json, descriptor) as T;
}

export function parseJsonStringUntyped(
  json: string,
  descriptor: MessageDescriptorUntyped
): any {
  return parseMessageUntyped(JSON.parse(json), descriptor);
}

export function parseMessage<T>(raw: any, descriptor: MessageDescriptor<T>): T {
  return parseMessageUntyped(raw, descriptor) as T;
}

export function parseMessageUntyped(
  raw: any,
  descriptor: MessageDescriptorUntyped
): any {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  let ret: any = {};
  for (let field of descriptor.fields) {
    let parseField: (rawField: any) => any;
    if (field.type === MessageFieldType.NUMBER) {
      parseField = (rawField: any): any => {
        if (typeof rawField === "number") {
          return rawField;
        } else {
          return undefined;
        }
      };
    } else if (field.type === MessageFieldType.BOOLEAN) {
      parseField = (rawField: any): any => {
        if (typeof rawField === "boolean") {
          return rawField;
        } else {
          return undefined;
        }
      };
    } else if (field.type === MessageFieldType.STRING) {
      parseField = (rawField: any): any => {
        if (typeof rawField === "string") {
          return rawField;
        } else {
          return undefined;
        }
      };
    } else if (field.type === MessageFieldType.ENUM) {
      parseField = (rawField: any): any => {
        return parseEnumUntyped(rawField, field.enumDescriptor);
      };
    } else if (field.type === MessageFieldType.MESSAGE) {
      parseField = (rawField: any): any => {
        return parseMessageUntyped(rawField, field.messageDescriptor);
      };
    }

    if (!field.isArray) {
      ret[field.name] = parseField(raw[field.name]);
    } else {
      let values: any[] = [];
      if (Array.isArray(raw[field.name])) {
        for (let element of raw[field.name]) {
          let parsedValue = parseField(element);
          if (parsedValue !== undefined) {
            values.push(parsedValue);
          }
        }
      }
      ret[field.name] = values;
    }
  }
  return ret;
}
