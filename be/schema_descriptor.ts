import { MessageDescriptor } from "../message_descriptor";

export interface SchemaDescriptor<T> {
  valueDescriptor: MessageDescriptor<T>;
  getKey: (value: T) => string;
  getIndex: (value: T) => string[];
}
