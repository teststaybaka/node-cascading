import { MessageParser } from "./message_parser";

export interface SchemaDescriptor<T> {
  valueParser: MessageParser<T>;
  getKey: (value: T) => string;
  getIndex: (value: T) => string[];
}
