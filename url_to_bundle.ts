import { MessageUtil } from "selfage/message_util";

export enum BundleTarget {
  JS = 1,
  HTML = 2,
}

export class BundleTargetUtil implements MessageUtil<BundleTarget> {
  public from(obj?: any): BundleTarget {
    if (!obj || typeof obj !== "number" || !(obj in BundleTarget)) {
      return undefined;
    } else {
      return obj;
    }
  }
}

export let BUNDLE_TARGET_UTIL = new BundleTargetUtil();

export interface UrlToBundle {
  // Without protocol or domain, starting with "/", and ending without "/". Only
  // Applies to GET method.
  url?: string;
  // TypeScript file path to be served to the url, ending without ".ts".
  modulePath?: string;
  // Default to HTML. Defines which format the TypeScript file needs to be
  // compiled/bundled, before serving to the url.
  target?: BundleTarget;
}

export class UrlToBundleUtil implements MessageUtil<UrlToBundle> {
  public from(obj?: any, output?: object): UrlToBundle {
    if (!obj || typeof obj !== "object") {
      return undefined;
    }

    let ret: UrlToBundle;
    if (output) {
      ret = output;
    } else {
      ret = {};
    }
    if (typeof obj.url === "string") {
      ret.url = obj.url;
    }
    if (typeof obj.modulePath === "string") {
      ret.modulePath = obj.modulePath;
    }
    ret.target = BUNDLE_TARGET_UTIL.from(obj.target);
    return ret;
  }
}

export let URL_TO_BUNDLE_UTIL = new UrlToBundleUtil();
