export enum HttpMethod {
  GET,
  POST,
  OPTIONS,
}

export let DEFAULT_URL_TO_BUNDLES_FILE = "./url_to_bundles.json";
export let CONTENT_TYPE_TEXT = "text/plain";
export let CONTENT_TYPE_HTML = "text/html";
export let CONTENT_TYPE_JAVASCRIPT = "text/javascript";
export let CONTENT_TYPE_JPEG = "image/jpeg";
export let CONTENT_TYPE_PNG = "image/png";
export let CONTENT_TYPE_GIF = "image/GIF";
export let CONTENT_TYPE_JSON = "application/json";
export let CONTENT_TYPE_BINARY_STREAM = "application/octet-stream";
export let SESSION_HEADER = "X-SESSION";
export let ACCEPT_ENCODING_HEADER = "Accept-Encoding";
export let BUNDLE_EXT = ".bundle";
export let GZIP_EXT = ".tar.gz";

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

export function extendSet<Value>(set: Set<Value>, fromSet: Set<Value>): void {
  for (
    let iter = fromSet.values(), result = iter.next();
    !result.done;
    result = iter.next()
  ) {
    set.add(result.value);
  }
}
