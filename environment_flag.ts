import { ENVIRONMENT, Environment } from "./environment";
import { parseJsonString } from "./named_type_util";

declare let environment_flag: string;

export function getEnvironment(): Environment {
  return parseJsonString(environment_flag, ENVIRONMENT);
}
