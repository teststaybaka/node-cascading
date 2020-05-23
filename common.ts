export enum HttpMethod {
  GET,
  POST,
  OPTIONS,
}

export let CONTENT_TYPE_TEXT = "text/plain";
export let CONTENT_TYPE_HTML = "text/html";
export let CONTENT_TYPE_JSON = "application/json";
export let CONTENT_TYPE_BINARY_STREAM = "application/octet-stream";
export let SESSION_HEADER = "X-SESSION";

export function findWithDefault<Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  defaultValue: Value
): Value {
  let value = map.get(key);
  if (value === undefined) {
    return defaultValue;
  } else {
    return value;
  }
}

export function extendArray<Value>(list: Value[], fromList: Value[]): void {
  for (let value of fromList) {
    list.push(value);
  }
}

export function extendSet<Value>(set: Set<Value>, fromSet: Set<Value>): void {
  for (
    let iter = fromSet.values(), result = iter.next();
    !result.done;
    result = iter.next()
  ) {
    set.add(result.value);
  }
}
