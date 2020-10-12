import fs = require("fs");
import { ENVIRONMENT_FLAG_VALUE_FILE } from "../constants";
import { ENVIRONMENT, Environment } from "../environment";
import { findWithDefault } from "../map_util";
import { parseJsonString } from "../named_type_util";

// An exception to load the flag value on startup.
let ENVIRONMENT_FLAG = fs.readFileSync(ENVIRONMENT_FLAG_VALUE_FILE).toString();

export function mapEnvironment<Value>(
  mapping: Map<Environment, Value>,
  defaultValue: Value
): Value {
  let environment = parseJsonString(ENVIRONMENT_FLAG, ENVIRONMENT);
  return findWithDefault(mapping, environment, defaultValue);
}
