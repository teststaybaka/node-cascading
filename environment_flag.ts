import { ENVIRONMENT, Environment } from "./environment";
import { parseJsonString } from "./named_type_util";

declare let environment_flag: string;

export function mapEnvironment(
  mapping: Map<Environment, string>,
  defaultValue: string
): Environment {
  let environment = parseJsonString(environment_flag, ENVIRONMENT);
  return findWithDefault(mapping, environment, defaultValue);
}
