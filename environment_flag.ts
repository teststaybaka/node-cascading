import { ENVIRONMENT, Environment } from "./environment";
import { parseJsonString } from "./named_type_util";

declare let environment_flag: string;

export function getEnvironmentFlag(): Environment {
  return parseJsonString(environment_flag, ENVIRONMENT);
}
