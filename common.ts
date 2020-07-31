export let CONTENT_TYPE_TEXT = "text/plain";
export let CONTENT_TYPE_HTML = "text/html";
export let CONTENT_TYPE_JAVASCRIPT = "text/javascript";
export let CONTENT_TYPE_JPEG = "image/jpeg";
export let CONTENT_TYPE_PNG = "image/png";
export let CONTENT_TYPE_GIF = "image/GIF";
export let CONTENT_TYPE_JSON = "application/json";
export let CONTENT_TYPE_BINARY_STREAM = "application/octet-stream";

export let SESSION_HEADER = "X-SESSION";

export let FILE_NOT_EXISTS_ERROR_CODE = "ENOENT";

export let BUNDLE_EXT = ".bundle";
export let GZIP_EXT = ".tar.gz";
export let ACCEPT_ENCODING_HEADER = "Accept-Encoding";
export let URL_TO_BUNDLES_CONFIG_FILE = "./url_to_bundles.json";
export let CHROME_EXTENSION_BUNDLES_CONFIG_FILE =
  "./chrome_extension_bundles.json";

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

export function invoke<T>(toBeInvoked: () => T): T {
  return toBeInvoked();
}
