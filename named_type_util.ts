import {
  EnumValue,
  MessageField,
  MessageFieldType,
  NamedTypeDescriptor,
  NamedTypeKind,
} from "./named_type_descriptor";

export function parseJsonString<T>(
  json: string,
  descriptor: NamedTypeDescriptor<T>
): T {
  return parseNamedType<T>(JSON.parse(json), descriptor);
}

export function parseNamedType<T>(
  raw: any,
  descriptor: NamedTypeDescriptor<T>
): T {
  if (descriptor.kind === NamedTypeKind.ENUM) {
    return parseEnum(raw, descriptor.enumValues);
  } else if (descriptor.kind === NamedTypeKind.MESSAGE) {
    return parseMessage(raw, descriptor.messageFields);
  }
}

function parseEnum(raw: any, enumValues: EnumValue[]): any {
  let enumValueFound: EnumValue;
  if (typeof raw === "string") {
    enumValueFound = enumValues.find((enumValue): boolean => {
      return enumValue.name === raw;
    });
  } else if (typeof raw === "number") {
    enumValueFound = enumValues.find((enumValue): boolean => {
      return enumValue.value === raw;
    });
  }
  if (enumValueFound === undefined) {
    return undefined;
  } else {
    return enumValueFound.value;
  }
}

function parseMessage(raw: any, messageFields: MessageField[]): any {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  let ret: any = {};
  for (let field of messageFields) {
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
    } else if (field.type === MessageFieldType.NAMED_TYPE) {
      parseField = (rawField: any): any => {
        return parseNamedType(rawField, field.namedTypeDescriptor);
      };
    }

    if (!field.isArray) {
      ret[field.name] = parseField(raw[field.name]);
    } else if (!Array.isArray(raw[field.name])) {
      ret[field.name] = undefined;
    } else {
      let values: any[] = [];
      for (let element of raw[field.name]) {
        let parsedValue = parseField(element);
        if (parsedValue !== undefined) {
          values.push(parsedValue);
        }
      }
      ret[field.name] = values;
    }
  }
  return ret;
}
