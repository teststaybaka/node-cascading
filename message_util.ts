import {
  EnumDescriptor,
  EnumDescriptorUntyped,
  EnumValue,
  MessageDescriptor,
  MessageDescriptorUntyped,
  MessageFieldType,
} from "./message_descriptor";

export interface MessageUtil<T> {
  from: (obj?: any, output?: object) => T;
}

export class MessageParser {
  public static parseEnum<T>(raw: any, descriptor: EnumDescriptor<T>): T {
    return MessageParser.parseEnumUntyped(raw, descriptor) as T;
  }

  public static parseEnumUntyped(
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

  public static parseJsonString<T>(
    json: string,
    descriptor: MessageDescriptor<T>
  ): T {
    return MessageParser.parseJsonStringUntyped(json, descriptor) as T;
  }

  public static parseJsonStringUntyped(
    json: string,
    descriptor: MessageDescriptorUntyped
  ): any {
    return MessageParser.parseMessageUntyped(JSON.parse(json), descriptor);
  }

  public static parseMessage<T>(
    raw: any,
    descriptor: MessageDescriptor<T>
  ): T {
    return MessageParser.parseMessageUntyped(raw, descriptor) as T;
  }

  public static parseMessageUntyped(
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
          return MessageParser.parseEnumUntyped(rawField, field.enumDescriptor);
        };
      } else if (field.type === MessageFieldType.MESSAGE) {
        parseField = (rawField: any): any => {
          return MessageParser.parseMessageUntyped(
            rawField,
            field.messageDescriptor
          );
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
}
