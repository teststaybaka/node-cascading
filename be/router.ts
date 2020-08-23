import fs = require("fs");
import http = require("http");
import https = require("https");
import url = require("url");
import {
  ACCEPT_ENCODING_HEADER,
  CONTENT_TYPE_TEXT,
  FILE_NOT_EXISTS_ERROR_CODE,
  HttpMethod,
  URL_TO_MODULES_CONFIG_FILE,
} from "../common";
import { ErrorType, TypedError, newInternalError } from "../errors";
import { parseJsonString } from "../named_type_util";
import { URL_TO_MODULE_MAPPING, UrlToModule } from "../url_to_module";
import { HttpHandler, HttpResponse } from "./http_handler";
import { LOGGER } from "./logger";
import { PreflightHandler } from "./preflight_handler";
import { StaticHtmlHandler } from "./static_handler";

// TODO: Rate limit requests.
export class Router {
  private static HTTP_PORT = 80;
  private static HTTPS_PORT = 443;
  private static CONTENT_TYPE_HEADER = "Content-Type";
  private static CONTENT_ENCODING_HEADER = "Content-Encoding";
  private static ALLOW_ORIGIN_HEADER = "Access-Control-Allow-Origin";
  private static ALLOW_METHODS_HEADER = "Access-Control-Allow-Methods";
  private static ALLOW_HEADERS_HEADER = "Access-Control-Allow-Headers";
  private static LOCATION_HEADER = "Location";
  private static VARY_HEADER = "Vary";
  private static CACHE_CONTROL_HEADER = "Cache-Control";
  private static CACHE_RESPONSE = "max-age=86400";
  private static REDIRECT_CODE = 307;
  private static OK_CODE = 200;
  private static REQUEST_ID_RANDOM_MAX = 10000;
  private static HTTPS_PROTOCAL = "https://";

  private handlers: HttpHandler[] = [];

  public static create(
    hostname: string,
    httpsOption?: https.ServerOptions
  ): Router {
    let httpServer = http.createServer();
    let httpsServer = undefined;
    if (httpsOption) {
      httpsServer = https.createServer(httpsOption);
    }
    let router = new Router(hostname, httpServer, httpsServer);
    router.addHandler(new PreflightHandler());

    let urlToModules = Router.readUrlToModules();
    for (let urlToModule of urlToModules) {
      router.addHandler(new StaticHtmlHandler(urlToModule));
    }
    return router;
  }

  private static readUrlToModules(): UrlToModule[] {
    let urlToModulesBuffer: Buffer;
    try {
      urlToModulesBuffer = fs.readFileSync(URL_TO_MODULES_CONFIG_FILE);
    } catch (e) {
      if (e.code !== FILE_NOT_EXISTS_ERROR_CODE) {
        return [];
      } else {
        throw e;
      }
    }

    let urlToModuleMapping = parseJsonString(
      urlToModulesBuffer.toString(),
      URL_TO_MODULE_MAPPING
    );
    if (urlToModuleMapping) {
      return urlToModuleMapping.urlToModules;
    } else {
      return [];
    }
  }

  public constructor(
    private hostname: string,
    private httpServer: http.Server,
    private httpsServer?: https.Server
  ) {
    if (this.httpsServer) {
      this.httpServer.addListener(
        "request",
        (request: http.IncomingMessage, response: http.ServerResponse): void =>
          this.redirectToHttps(request, response)
      );
      this.httpsServer.addListener(
        "request",
        (
          request: http.IncomingMessage,
          response: http.ServerResponse
        ): Promise<void> => this.handle(request, response)
      );
    } else {
      this.httpServer.addListener(
        "request",
        (
          request: http.IncomingMessage,
          response: http.ServerResponse
        ): Promise<void> => this.handle(request, response)
      );
    }
  }

  private redirectToHttps(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ): void {
    LOGGER.info(
      `Redirecting to ${Router.HTTPS_PROTOCAL + this.hostname + request.url}.`
    );
    response.setHeader(Router.ALLOW_ORIGIN_HEADER, "*");
    response.setHeader(Router.ALLOW_METHODS_HEADER, "*");
    response.setHeader(Router.ALLOW_HEADERS_HEADER, "*");
    response.writeHead(Router.REDIRECT_CODE, {
      [Router.LOCATION_HEADER]:
        Router.HTTPS_PROTOCAL + this.hostname + request.url,
    });
    response.end();
  }

  private async handle(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ): Promise<void> {
    let randomId = Math.floor(Math.random() * Router.REQUEST_ID_RANDOM_MAX);
    let logContext = `Request ${Date.now()}-${randomId}: `;

    response.setHeader(Router.ALLOW_ORIGIN_HEADER, "*");
    response.setHeader(Router.ALLOW_METHODS_HEADER, "*");
    response.setHeader(Router.ALLOW_HEADERS_HEADER, "*");
    response.setHeader(Router.VARY_HEADER, ACCEPT_ENCODING_HEADER);

    let httpResponse: HttpResponse;
    try {
      httpResponse = await this.dispatch(logContext, request);
    } catch (error) {
      LOGGER.error(logContext + error.stack);
      response.setHeader(Router.CONTENT_TYPE_HEADER, CONTENT_TYPE_TEXT);
      if (error.errorType) {
        response.writeHead((error as TypedError).errorType);
      } else {
        response.writeHead(ErrorType.Internal);
      }
      response.end(error.message);
      return;
    }

    response.setHeader(Router.CONTENT_TYPE_HEADER, httpResponse.contentType);
    if (!httpResponse.contentFile) {
      response.writeHead(Router.OK_CODE);
      response.end(httpResponse.content);
    } else {
      if (httpResponse.encoding) {
        response.setHeader(
          Router.CONTENT_ENCODING_HEADER,
          httpResponse.encoding
        );
      }
      response.setHeader(Router.CACHE_CONTROL_HEADER, Router.CACHE_RESPONSE);
      response.writeHead(Router.OK_CODE);

      let readStream = fs.createReadStream(httpResponse.contentFile);
      readStream.on("error", (err: Error): void => {
        LOGGER.error(logContext + err.stack);
      });
      response.on("error", (err): void => {
        LOGGER.error(logContext + err.stack);
      });
      readStream.pipe(response);
    }
  }

  private async dispatch(
    logContext: string,
    request: http.IncomingMessage
  ): Promise<HttpResponse> {
    let method = request.method.toUpperCase();
    let parsedUrl = url.parse(request.url);

    LOGGER.info(
      logContext +
        `Request received:\n` +
        `pathname: ${parsedUrl.pathname}\n` +
        `method: ${method}`
    );

    for (let i = 0; i < this.handlers.length; i++) {
      let handler = this.handlers[i];
      if (
        method === HttpMethod[handler.method] &&
        parsedUrl.pathname.match(handler.urlRegex)
      ) {
        LOGGER.info(
          logContext +
            `Handler ${i} matched request with ` +
            `[${handler.urlRegex}, ${handler.method}].`
        );
        return handler.handle(logContext, request, parsedUrl);
      }
    }

    throw newInternalError(`Not Found :/`);
  }

  public start(): void {
    this.httpServer.listen(Router.HTTP_PORT);
    LOGGER.info(`Http server started at ${Router.HTTP_PORT}.`);
    if (this.httpsServer) {
      this.httpsServer.listen(Router.HTTPS_PORT);
      LOGGER.info(`Https server started at ${Router.HTTPS_PORT}.`);
    }
  }

  public addHandler(httpHandler: HttpHandler): void {
    this.handlers.push(httpHandler);
  }
}
