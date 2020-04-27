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
  public urlRegex: RegExp;
  public method = HttpMethod.GET;
  private contentType: string;

  public constructor(urlText: string, private filePath: string) {
    this.urlRegex = new RegExp(`^${urlText}$`);
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
  public urlRegex: RegExp;
  public method = HttpMethod.GET;

  public constructor(urlPrefix: string, private localDir: string) {
    this.urlRegex = new RegExp(`^${urlPrefix}/(.*)$`);
  }

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

