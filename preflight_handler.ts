import http = require('http');
import url = require('url');
import { CONTENT_TYPE_TEXT, HttpMethod } from './common';
import { SingletonFactory } from './singleton_factory';
import { HttpHandler, HttpResponse } from './http_handler';

class PreflightHandler implements HttpHandler {
  public method = HttpMethod.OPTIONS;
  public urlRegex: RegExp;

  public init(): void {
    this.urlRegex = /^\/.*$/;
  }

  public handle(logContext: string,  request: http.IncomingMessage, parsedUrl: url.Url): Promise<HttpResponse> {
    return Promise.resolve({
      contentType: CONTENT_TYPE_TEXT,
      content: 'ok',
    });
  }
}

export let PREFLIGHT_HANDLER_FACTORY = new SingletonFactory((): PreflightHandler => {
  let handler = new PreflightHandler();
  handler.init();
  return handler;
});