import { MessageUtil } from "./message_util";

export interface UrlToBundle {
  // Without protocol or domain, starting with "/", and ending without "/". Only
  // Applies to GET method.
  url?: string;
  // TypeScript file path to be served to the url, ending without ".ts", which
  // will be served inside an HTML file.
  modulePath?: string;
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
    return ret;
  }
}

export let URL_TO_BUNDLE_UTIL = new UrlToBundleUtil();

export interface UrlToBundlesHolder {
  urlToBundles?: UrlToBundle[];
}

export class UrlToBundlesHolderUtil implements MessageUtil<UrlToBundlesHolder> {
  public from(obj?: any, output?: object): UrlToBundlesHolder {
    if (!obj || typeof obj !== "object") {
      return undefined;
    }

    let ret: UrlToBundlesHolder;
    if (output) {
      ret = output;
    } else {
      ret = {};
    }
    ret.urlToBundles = [];
    if (Array.isArray(obj.urlToBundles)) {
      for (let element of obj.urlToBundles) {
        let parsedElement = URL_TO_BUNDLE_UTIL.from(element);
        if (parsedElement !== undefined) {
          ret.urlToBundles.push(parsedElement);
        }
      }
    }
    return ret;
  }
}

export let URL_TO_BUNDLES_HOLDER_UTIL = new UrlToBundlesHolderUtil();
