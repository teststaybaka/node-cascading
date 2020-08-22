import querystring = require("querystring");
import { LazyConstructor } from "../lazy_constructor";
import { NavigationHandlerUntyped } from "./navigation_handler";

export class NavigationRouter {
  private static PARAMS_KEY_IN_QUERY_STRING = "params";

  private handlers: NavigationHandlerUntyped[] = [];
  private lastHandler: NavigationHandlerUntyped;

  public constructor(private window: Window) {}

  public addHandler(handler: NavigationHandlerUntyped) {
    this.handlers.push(handler);
  }

  public async dispatchFromCurrentUrl(): Promise<void> {
    let paramsAsQueryString = querystring.parse(
      this.window.location.search.substr(1)
    )[NavigationRouter.PARAMS_KEY_IN_QUERY_STRING];

    let params;
    if (typeof paramsAsQueryString === "string") {
      try {
        params = JSON.parse(paramsAsQueryString);
      } catch (e) {
        console.warn(`${paramsAsQueryString} cannot be parsed into JSON.`);
      }
    }
    await this.dispatchOnly(this.window.location.pathname, params);
  }

  public async dispatch(pathname: string, params?: any): Promise<void> {
    let url;
    if (params) {
      url =
        pathname +
        "?" +
        querystring.stringify({
          [NavigationRouter.PARAMS_KEY_IN_QUERY_STRING]: JSON.stringify(params),
        });
    } else {
      url = pathname;
    }
    console.log(url);
    this.window.history.pushState(undefined, "", url);
    let handled = await this.dispatchOnly(pathname, params);
    if (!handled) {
      this.window.location.reload();
    }
  }

  private async dispatchOnly(pathname: string, params?: any): Promise<boolean> {
    if (this.lastHandler) {
      this.lastHandler.hide();
      this.lastHandler = undefined;
    }
    for (let handler of this.handlers) {
      if (handler.pathname === pathname) {
        this.lastHandler = handler;
        await handler.show(params);
        return true;
      }
    }
    return false;
  }
}

export let LAZY_NAVIGATION_ROUTER = new LazyConstructor(
  (): NavigationRouter => {
    return new NavigationRouter(window);
  }
);
