import http = require("http");
import path = require("path");
import url = require("url");
import {
  ACCEPT_ENCODING_HEADER,
  CONTENT_TYPE_BINARY_STREAM,
  CONTENT_TYPE_GIF,
  CONTENT_TYPE_JAVASCRIPT,
  CONTENT_TYPE_JPEG,
  CONTENT_TYPE_PNG,
  GZIP_EXT,
} from "../constants";
import { newInternalError } from "../errors";
import { HttpMethod } from "../http_method";
import { findWithDefault } from "../map_util";
import { UrlToModule } from "../url_to_module";
import { HttpHandler, HttpResponse } from "./http_handler";

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

// Returns bundled HTML files with compression if possible.
export class StaticHtmlHandler implements HttpHandler {
  private static GZIP_ACCEPT_ENCODING = /\bgzip\b/;
  private static GZIP_CONTENT_ENCODING = "gzip";

  public urlRegex: RegExp;
  public method = HttpMethod.GET;
  private htmlPath: string;
  private contentType = CONTENT_TYPE_JAVASCRIPT;

  public constructor(urlToModule: UrlToModule) {
    this.urlRegex = new RegExp(`^${urlToModule.url}$`);
    this.htmlPath = urlToModule.modulePath + ".html";
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

    if (StaticHtmlHandler.GZIP_ACCEPT_ENCODING.test(acceptEncoding)) {
      return {
        contentType: this.contentType,
        contentFile: this.htmlPath + GZIP_EXT,
        encoding: StaticHtmlHandler.GZIP_CONTENT_ENCODING,
      };
    } else {
      return { contentType: this.contentType, contentFile: this.htmlPath };
    }
  }
}
