import http = require('http');
import url = require('url');
import { CONTENT_TYPE_JSON, HttpMethod, SESSION_HEADER } from './common';
import { HttpHandler, HttpResponse } from './http_handler';
import { STREAM_READER } from './stream_reader';
import { SignedInServiceDescriptor, SignedOutServiceDescriptor, ServiceDescriptor } from './service_descriptor';
import { SECURE_SESSION_VERIFIER } from './session';

interface SubServiceHandler<Request, Response> {
  handle: ((logContext: string, request: Request, userId?: string) => Promise<Response>),
}

export interface SignedInSubServiceHandler<Request, Response> extends SubServiceHandler<Request, Response> {
  handle: ((logContext: string, request: Request, userId: string) => Promise<Response>),
}

export interface SignedOutSubServiceHandler<Request, Response> extends SubServiceHandler<Request, Response> {
  handle: ((logContext: string, request: Request) => Promise<Response>),
}

class ServiceHandler<Request, Response> implements HttpHandler {
  public method = HttpMethod.POST;
  public urlRegex = new RegExp(`^${this.serviceDescriptor.pathname}$`);

  public constructor(private serviceDescriptor: ServiceDescriptor<Request, Response>,
    private subServiceHandler: SubServiceHandler<Request, Response>,
    private signedIn: boolean) {
  }

  public async handle(logContext: string, request: http.IncomingMessage,
    parsedUrl: url.Url): Promise<HttpResponse> {
    let userId: string;
    if (this.signedIn) {
      let session = request.headers[SESSION_HEADER] as string;
      userId = SECURE_SESSION_VERIFIER.verifyAndGetUserId(session);
    }
    let data = await STREAM_READER.readJson(request);
    let response = await this.subServiceHandler.handle(logContext,
      this.serviceDescriptor.constructRequest(data), userId);
    let httpResponse: HttpResponse = {
      contentType: CONTENT_TYPE_JSON,
      content: JSON.stringify(response),
    };
    return httpResponse;
  }
}

export class ServiceHandlerFactory {
  public createSignedInServiceHandler<Request, Response>(
    serviceDescriptor: SignedInServiceDescriptor<Request, Response>,
    subServiceHandler: SignedInSubServiceHandler<Request, Response>): ServiceHandler<Request, Response> {
    return new ServiceHandler(serviceDescriptor, subServiceHandler, true);
  }

  public createSignedOutServiceHandler<Request, Response>(
    serviceDescriptor: SignedOutServiceDescriptor<Request, Response>,
    subServiceHandler: SignedOutSubServiceHandler<Request, Response>): ServiceHandler<Request, Response> {
    return new ServiceHandler(serviceDescriptor, subServiceHandler, false);
  }
}
