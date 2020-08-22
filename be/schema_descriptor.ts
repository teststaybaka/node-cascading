import { NamedTypeDescriptor } from "../named_type_descriptor";

export interface SchemaDescriptor<T> {
  valueDescriptor: NamedTypeDescriptor<T>;
  getKey: (value: T) => string;
  getIndex: (value: T) => string[];
}
