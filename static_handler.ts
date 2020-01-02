import http = require('http');
import path = require('path');
import url = require('url');
import { CONTENT_TYPE_BINARY_STREAM, HttpMethod, findWithDefault } from './common';
import { newInternalError } from './errors';
import { HttpHandler, HttpResponse } from './http_handler';

let MIME_TYPES = new Map<string, string>([
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
  ['gif', 'image/gif'],
  ['js', 'text/javascript'],
]);

function findType(filePath: string): string {
  let extname = path.extname(filePath).substr(1);
  return findWithDefault(MIME_TYPES, extname, CONTENT_TYPE_BINARY_STREAM);
}

export class StaticFileHandler implements HttpHandler {
  public urlRegex = new RegExp(`^${this.urlText}$`);
  public method = HttpMethod.GET;

  private contentType: string;

  public constructor(private urlText: string, private filePath: string) {}

  public init(): void {
    this.contentType = findType(this.filePath);
  }

  public async handle(logContext: string, request: http.IncomingMessage, parsedUrl: url.Url): Promise<HttpResponse> {
    return {
      contentType: this.contentType,
      contentFile: this.filePath
    };
  }
}

export class StaticDirHandler implements HttpHandler {
  public urlRegex = new RegExp(`^${this.urlPrefix}/(.*)$`);
  public method = HttpMethod.GET;

  public constructor(private urlPrefix: string, private localDir: string) {}

  public async handle(logContext: string, request: http.IncomingMessage, parsedUrl: url.Url): Promise<HttpResponse> {
    let matched = parsedUrl.pathname.match(this.urlRegex);
    if (!matched) {
      throw newInternalError(`Pathname, ${parsedUrl.pathname}, didn't match url regex, ${this.urlRegex}.`);
    }

    let filePath = matched[1];
    let fullPath = path.join(this.localDir, filePath);
    let contentType = findType(fullPath);
    return {
      contentType: contentType,
      contentFile: fullPath
    };
  }
}

export class StaticFileHandlerFactory {
  public create(urlText: string, filePath: string): StaticFileHandler {
    let handler = new StaticFileHandler(urlText, filePath);
    handler.init();
    return handler;
  }
}

export class StaticDirHandlerFactory {
  public create(urlPrefix: string, localDir: string): StaticDirHandler {
    let handler = new StaticDirHandler(urlPrefix, localDir);
    return handler;
  }
}

export let STATIC_FILE_HANDLER_FACTORY = new StaticFileHandlerFactory();
export let STATIC_DIR_HANDLER_FACTORY = new StaticDirHandlerFactory();
