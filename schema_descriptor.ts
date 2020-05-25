import { MessageUtil } from "./message_util";

export interface SchemaDescriptor<T> {
  valueParser: MessageUtil<T>;
  getKey: (value: T) => string;
  getIndex: (value: T) => string[];
}
