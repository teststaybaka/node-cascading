import { ROUTER_TEST } from "./be/router_test";
import { SESSION_TEST } from "./be/session_test";
import { STATIC_HTTP_HANDLER_TEST } from "./be/static_handler_test";
import { NAVIGATION_ROUTER_TEST } from "./fe/navigation_router_test";
import { LINKED_LIST_TEST } from "./linked_list_test";
import { NAMED_TYPE_UTIL_TEST } from "./named_type_util_test";
import { OBSERVABLE_ARRAY_TEST } from "./observable_array_test";
import { runTests } from "./test_runner";

runTests([
  LINKED_LIST_TEST,
  NAMED_TYPE_UTIL_TEST,
  NAVIGATION_ROUTER_TEST,
  ROUTER_TEST,
  SESSION_TEST,
  STATIC_HTTP_HANDLER_TEST,
  OBSERVABLE_ARRAY_TEST,
]);
