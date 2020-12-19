import { MessageDescriptor } from "../message_descriptor";

export interface DatastoreFilter {
  indexName: string;
  indexValue: any;
  // Defined by Datastore API but not exported.
  operator: "=" | "<" | ">" | "<=" | ">=";
  descending: boolean;
}

export interface DatastoreQuery<T> {
  startToken: string;
  limit: number;
  filters: Array<DatastoreFilter>;
}

export interface DatastoreModelDescriptor<T> {
  name: string;
  key: string;
  excludedIndexes: Array<string>;
  valueDescriptor: MessageDescriptor<T>;
}
