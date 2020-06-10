import http = require("http");
import url = require("url");
import { CONTENT_TYPE_JSON, HttpMethod, SESSION_HEADER } from "./common";
import { HttpHandler, HttpResponse } from "./http_handler";
import { StreamReader } from "./stream_reader";
import {
  SignedInServiceDescriptor,
  SignedOutServiceDescriptor,
} from "./service_descriptor";
import { SecureSessionVerifier } from "./session";

export interface SignedInServiceHandler<Request, Response> {
  handle: (
    logContext: string,
    request: Request,
    userId: string
  ) => Promise<Response>;
}

export interface SignedOutServiceHandler<Request, Response> {
  handle: (logContext: string, request: Request) => Promise<Response>;
}

export class BaseSignedInServiceHandler<Request, Response>
  implements HttpHandler {
  public method = HttpMethod.POST;
  public urlRegex = new RegExp(`^${this.serviceDescriptor.pathname}$`);
  private streamReader = new StreamReader();
  private secureSessionVerifier = SecureSessionVerifier.create();

  public constructor(
    private serviceDescriptor: SignedInServiceDescriptor<Request, Response>,
    private subServiceHandler: SignedInServiceHandler<Request, Response>
  ) {}

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    let session = request.headers[SESSION_HEADER.toLowerCase()] as string;
    let userId = this.secureSessionVerifier.verifyAndGetUserId(session);
    let obj = await this.streamReader.readJson(request);
    let response = await this.subServiceHandler.handle(
      logContext,
      this.serviceDescriptor.requestParser.from(obj),
      userId
    );
    let httpResponse: HttpResponse = {
      contentType: CONTENT_TYPE_JSON,
      content: JSON.stringify(response),
    };
    return httpResponse;
  }
}

export class BaseSignedOutServiceHandler<Request, Response>
  implements HttpHandler {
  public method = HttpMethod.POST;
  public urlRegex = new RegExp(`^${this.serviceDescriptor.pathname}$`);
  private streamReader = new StreamReader();

  public constructor(
    private serviceDescriptor: SignedOutServiceDescriptor<Request, Response>,
    private subServiceHandler: SignedOutServiceHandler<Request, Response>
  ) {}

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    let obj = await this.streamReader.readJson(request);
    let response = await this.subServiceHandler.handle(
      logContext,
      this.serviceDescriptor.requestParser.from(obj)
    );
    let httpResponse: HttpResponse = {
      contentType: CONTENT_TYPE_JSON,
      content: JSON.stringify(response),
    };
    return httpResponse;
  }
}
