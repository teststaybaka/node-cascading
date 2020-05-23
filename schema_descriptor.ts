import { MessageSerializer } from "./message_serializer";

export interface SchemaDescriptor<T> {
  valueSerializer: MessageSerializer<T>;
  getKey: (value: T) => string;
  getIndex: (value: T) => string[];
}
