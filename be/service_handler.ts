import http = require("http");
import url = require("url");
import { CONTENT_TYPE_JSON, SESSION_HEADER } from "../constants";
import { HttpMethod } from "../http_method";
import { parseMessage } from "../message_util";
import {
  SignedInServiceDescriptor,
  SignedOutServiceDescriptor,
} from "../service_descriptor";
import { STREAM_READER } from "../stream_reader";
import { HttpHandler, HttpResponse } from "./http_handler";
import { SecureSessionVerifier } from "./session";

export interface SignedInServiceHandler<Request, Response> {
  serviceDescriptor: SignedInServiceDescriptor<Request, Response>;
  handle: (
    logContext: string,
    request: Request,
    userId: string
  ) => Promise<Response>;
}

export interface SignedOutServiceHandler<Request, Response> {
  serviceDescriptor: SignedOutServiceDescriptor<Request, Response>;
  handle: (logContext: string, request: Request) => Promise<Response>;
}

export class SuperSignedInServiceHandler<Request, Response>
  implements HttpHandler {
  public method = HttpMethod.POST;
  public urlRegex = new RegExp(
    `^${this.serviceHandler.serviceDescriptor.pathname}$`
  );
  private secureSessionVerifier = SecureSessionVerifier.create();

  public constructor(
    private serviceHandler: SignedInServiceHandler<Request, Response>
  ) {}

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    let session = request.headers[SESSION_HEADER.toLowerCase()] as string;
    let userId = this.secureSessionVerifier.verifyAndGetUserId(session);
    let obj = await STREAM_READER.readJson(request);
    let response = await this.serviceHandler.handle(
      logContext,
      parseMessage(
        obj,
        this.serviceHandler.serviceDescriptor.requestDescriptor
      ),
      userId
    );
    let httpResponse: HttpResponse = {
      contentType: CONTENT_TYPE_JSON,
      content: JSON.stringify(response),
    };
    return httpResponse;
  }
}

export class SuperSignedOutServiceHandler<Request, Response>
  implements HttpHandler {
  public method = HttpMethod.POST;
  public urlRegex = new RegExp(
    `^${this.serviceHandler.serviceDescriptor.pathname}$`
  );

  public constructor(
    private serviceHandler: SignedOutServiceHandler<Request, Response>
  ) {}

  public async handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    let obj = await STREAM_READER.readJson(request);
    let response = await this.serviceHandler.handle(
      logContext,
      parseMessage(
        obj,
        this.serviceHandler.serviceDescriptor.requestDescriptor
      )
    );
    let httpResponse: HttpResponse = {
      contentType: CONTENT_TYPE_JSON,
      content: JSON.stringify(response),
    };
    return httpResponse;
  }
}
