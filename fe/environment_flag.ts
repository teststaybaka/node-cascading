import { ENVIRONMENT, Environment } from "../environment";
import { findWithDefault } from "../map_util";
import { parseJsonString } from "../named_type_util";

declare let environment_flag: string;

export function mapEnvironment<Value>(
  mapping: Map<Environment, Value>,
  defaultValue: Value
): Value {
  let environment = parseJsonString(environment_flag, ENVIRONMENT);
  return findWithDefault(mapping, environment, defaultValue);
}
