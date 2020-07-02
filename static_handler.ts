import http = require("http");
import path = require("path");
import url = require("url");
import {
  ACCEPT_ENCODING_HEADER,
  BUNDLE_EXT,
  CONTENT_TYPE_BINARY_STREAM,
  CONTENT_TYPE_GIF,
  CONTENT_TYPE_JAVASCRIPT,
  CONTENT_TYPE_JPEG,
  CONTENT_TYPE_PNG,
  GZIP_EXT,
  HttpMethod,
  findWithDefault,
} from "./common";
import { newInternalError } from "./errors";
import { HttpHandler, HttpResponse } from "./http_handler";
import { UrlToBundle } from "./url_to_bundle";

let MIME_TYPES = new Map<string, string>([
  [".jpeg", CONTENT_TYPE_JPEG],
  [".jpg", CONTENT_TYPE_JPEG],
  [".png", CONTENT_TYPE_PNG],
  [".gif", CONTENT_TYPE_GIF],
]);

function findType(filePath: string): string {
  let extname = path.extname(filePath);
  return findWithDefault(MIME_TYPES, extname, CONTENT_TYPE_BINARY_STREAM);
}

// Returns files as it is.
export class StaticFileHandler implements HttpHandler {
  public urlRegex: RegExp;
  public method = HttpMethod.GET;
  private contentType: string;

  public constructor(urlText: string, private filePath: string) {
    this.urlRegex = new RegExp(`^${urlText}$`);
    this.contentType = findType(this.filePath);
  }

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    return {
      contentType: this.contentType,
      contentFile: this.filePath,
    };
  }
}

// Returns files under the directory as it is.
export class StaticDirHandler implements HttpHandler {
  public urlRegex: RegExp;
  public method = HttpMethod.GET;

  public constructor(urlPrefix: string, private localDir: string) {
    this.urlRegex = new RegExp(`^${urlPrefix}/(.*)$`);
  }

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    let matched = parsedUrl.pathname.match(this.urlRegex);
    if (!matched) {
      throw newInternalError(
        `Pathname ${parsedUrl.pathname} didn't match url regex ` +
          `${this.urlRegex}.`
      );
    }

    let filePath = path.normalize(matched[1]);
    if (filePath.startsWith("../")) {
      throw newInternalError(
        `Pathname ${parsedUrl.pathname} is not allowed to navigate to the ` +
          `parent directory of root.`
      );
    }

    let fullPath = path.join(this.localDir, filePath);
    let contentType = findType(fullPath);
    return {
      contentType: contentType,
      contentFile: fullPath,
    };
  }
}

// Returns bundled files with compression if possible.
export class StaticBundleHandler implements HttpHandler {
  private static GZIP_ACCEPT_ENCODING = /\bgzip\b/;
  private static GZIP_CONTENT_ENCODING = "gzip";

  public urlRegex: RegExp;
  public method = HttpMethod.GET;
  private bundlePath: string;
  private contentType = CONTENT_TYPE_JAVASCRIPT;

  public constructor(urlToBundle: UrlToBundle) {
    this.urlRegex = new RegExp(`^${urlToBundle.url}$`);
    this.bundlePath = urlToBundle.modulePath + BUNDLE_EXT;
  }

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    let acceptEncoding = request.headers[
      ACCEPT_ENCODING_HEADER.toLowerCase()
    ] as string;
    if (!acceptEncoding) {
      acceptEncoding = "";
    }

    if (StaticBundleHandler.GZIP_ACCEPT_ENCODING.test(acceptEncoding)) {
      return {
        contentType: this.contentType,
        contentFile: this.bundlePath + GZIP_EXT,
        encoding: StaticBundleHandler.GZIP_CONTENT_ENCODING,
      };
    } else {
      return { contentType: this.contentType, contentFile: this.bundlePath };
    }
  }
}
