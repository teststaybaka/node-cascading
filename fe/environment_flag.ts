import { ENVIRONMENT, Environment } from "../environment";
import { findWithDefault } from "../map_util";
import { parseEnum } from "../message_util";

declare let ENVIRONMENT_FLAG: string;

export function mapEnvironment<Value>(
  mapping: Map<Environment, Value>,
  defaultValue: Value
): Value {
  let environment = parseEnum(JSON.parse(ENVIRONMENT_FLAG), ENVIRONMENT);
  return findWithDefault(mapping, environment, defaultValue);
}
