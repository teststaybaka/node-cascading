import querystring = require("querystring");
import { LazyConstructor } from "./lazy_constructor";
import { NavigationHandler } from "./navigation_handler";

export class Navigator {
  private static PARAMS_KEY_IN_QUERY_STRING = "params=";

  private handlers: NavigationHandler[] = [];
  private lastHandler: NavigationHandler;

  public constructor(private window: Window) {}

  public addHandler(handler: NavigationHandler) {
    this.handlers.push(handler);
  }

  public async goForTheFirstTime(): Promise<void> {
    let paramsAsQueryString = querystring.parse(
      this.window.location.search.substr(1)
    )[Navigator.PARAMS_KEY_IN_QUERY_STRING];

    let params;
    if (typeof paramsAsQueryString === "string") {
      try {
        params = JSON.parse(paramsAsQueryString);
      } catch (e) {
        console.warn(`${paramsAsQueryString} cannot be parsed into JSON.`);
      }
    }
    await this.dispatch(this.window.location.pathname, params);
  }

  public async go(pathname: string, params?: any): Promise<void> {
    let url;
    if (params) {
      url =
        pathname +
        "?" +
        querystring.stringify({
          [Navigator.PARAMS_KEY_IN_QUERY_STRING]: encodeURIComponent(params),
        });
    } else {
      url = pathname;
    }
    this.window.history.pushState(undefined, "", url);
    let handled = await this.dispatch(pathname, params);
    if (!handled) {
      this.window.location.reload();
    }
  }

  private async dispatch(pathname: string, params?: any): Promise<boolean> {
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

export let LAZY_NAVIGATOR = new LazyConstructor(
  (): Navigator => {
    return new Navigator(window);
  }
);
