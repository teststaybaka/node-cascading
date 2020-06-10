import { MessageUtil } from "./message_util";

export enum BundleFormat {
  JS = 1,
  HTML = 2,
}

export class BundleFormatUtil implements MessageUtil<BundleFormat> {
  public from(obj?: any): BundleFormat {
    if (typeof obj === "number" && obj in BundleFormat) {
      return obj;
    }
    if (typeof obj === "string" && obj in BundleFormat) {
      return BundleFormat[obj as keyof typeof BundleFormat];
    }
    return undefined;
  }
}

export let BUNDLE_FORMAT_UTIL = new BundleFormatUtil();

export interface UrlToBundle {
  // Without protocol or domain, starting with "/", and ending without "/". Only
  // Applies to GET method.
  url?: string;
  // TypeScript file path to be served to the url, ending without ".ts".
  modulePath?: string;
  // Default to HTML. Defines which format the TypeScript file needs to be
  // compiled/bundled, before serving to the url.
  bundleFormat?: BundleFormat;
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
    ret.bundleFormat = BUNDLE_FORMAT_UTIL.from(obj.bundleFormat);
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
    if (Array.isArray(obj.urlToBundles)) {
      ret.urlToBundles = [];
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
