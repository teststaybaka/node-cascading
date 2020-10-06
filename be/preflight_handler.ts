import http = require("http");
import url = require("url");
import { CONTENT_TYPE_TEXT } from "../constants";
import { HttpMethod } from "../http_method";
import { HttpHandler, HttpResponse } from "./http_handler";

export class PreflightHandler implements HttpHandler {
  public method = HttpMethod.OPTIONS;
  public urlRegex = /^\/.*$/;

  public handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    return Promise.resolve({
      contentType: CONTENT_TYPE_TEXT,
      content: "ok",
    });
  }
}
