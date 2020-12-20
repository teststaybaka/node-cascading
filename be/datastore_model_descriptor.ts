import { MessageDescriptor } from "../message_descriptor";

// Defined by Datastore API but not exported.
export type Operator = "=" | "<" | ">" | "<=" | ">=";
export interface DatastoreFilter {
  indexName: string;
  indexValue: any;
  operator: Operator;
  descending: boolean;
}

export interface DatastoreQuery<T> {
  startToken?: string;
  limit?: number;
  filters: Array<DatastoreFilter>;
}

export interface DatastoreModelDescriptor<T> {
  name: string;
  key: string;
  excludedIndexes: Array<string>;
  valueDescriptor: MessageDescriptor<T>;
}
