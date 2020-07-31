import http = require("http");
import url = require("url");

export enum HttpMethod {
  GET,
  POST,
  OPTIONS,
}

export interface HttpResponse {
  contentType: string;
  // One of the below.
  content?: string;
  contentFile?: string;
  // Only applies to contentFile.
  encoding?: string;
}

export interface HttpHandler {
  method: HttpMethod;
  urlRegex: RegExp;
  handle: (
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ) => Promise<HttpResponse>;
}
