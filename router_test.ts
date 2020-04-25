import http = require('http');
import url = require('url');
import { HttpMethod } from './common';
import { newInternalError } from './errors';
import { TestCase, assert, assertContains, runTests } from './test_base';
import { HttpResponse } from './http_handler';
import { Router } from './router';

class MockResponse {
  public statusCode: number;
  public headers: any;
  public endData: string;

  public setHeader(name: string, value: any) {
    // Ignore
  }

  public writeHead(statusCode: number, headers?: any) {
    this.statusCode = statusCode;
    this.headers = headers;
  }

  public end(data: string) {
    this.endData = data;
  }
}

class MockHttpServer {
  public callback: ((request: http.IncomingMessage, response: http.ServerResponse) => Promise<void>);
  public request: any;
  public response: any;

  public addListener(eventName: string,
                     callback: ((request: http.IncomingMessage, response: http.ServerResponse) => Promise<void>)) {
    this.callback = callback;
  }

  public triggerEvent() {
    return this.callback(this.request, this.response);
  }
}

class MockHttpHandler {
  public urlRegex: RegExp;
  public method: HttpMethod;
  public error: any;
  public handled = false
  public res: HttpResponse = {
    contentType: '',
    content: 'any content'
  };

  public getMethod() {
    return this.method;
  }
  public getUrlRegex() {
    return this.urlRegex;
  }
  public handle(logContext: string,
                request: http.IncomingMessage,
                url: url.Url): Promise<HttpResponse> {
    this.handled = true;
    if (this.error) {
      return Promise.reject(this.error);
    } else {
      return Promise.resolve(this.res);
    }
  }
}

class MatchHandler implements TestCase {
  public name = 'MatchHandler';

  public async execute() {
    // Prepare
    let mockRequest = {url: '/static/file', method: 'get'};
    let mockResponse = new MockResponse();
    let mockHttpServer = new MockHttpServer();
    mockHttpServer.request = mockRequest;
    mockHttpServer.response = mockResponse;
    let router = new Router('any hostname', mockHttpServer as any);
    let mockHandler = new MockHttpHandler();
    mockHandler.method = HttpMethod.GET;
    mockHandler.urlRegex = /^\/static\/123\/.*$/;
    let mockHandler2 = new MockHttpHandler();
    mockHandler2.method = HttpMethod.POST;
    mockHandler2.urlRegex = /^\/static\/.*$/;
    let mockHandler3 = new MockHttpHandler();
    mockHandler3.method = HttpMethod.GET;
    mockHandler3.urlRegex = /^\/static\/.*$/;
    let mockHandler4 = new MockHttpHandler();
    mockHandler4.method = HttpMethod.GET;
    mockHandler4.urlRegex = /^\/static\/.*$/;
    router.addHandler(mockHandler);
    router.addHandler(mockHandler2);
    router.addHandler(mockHandler3);
    router.addHandler(mockHandler4);

    // Execute
    await mockHttpServer.triggerEvent();

    // Verify
    assert(mockResponse.statusCode === 200);
    assert(mockResponse.endData === 'any content');
    assert(!mockHandler.handled);
    assert(!mockHandler2.handled);
    assert(mockHandler3.handled);
    assert(!mockHandler4.handled);
  }
}

class RejectHandler implements TestCase {
  public name = 'RejectHandler';

  public async execute() {
    // Prepare
    let mockRequest = {url: '/static/file', method: 'get'};
    let mockResponse = new MockResponse();
    let mockHttpServer = new MockHttpServer();
    mockHttpServer.request = mockRequest;
    mockHttpServer.response = mockResponse;
    let router = new Router('any hostname', mockHttpServer as any);
    let mockHandler = new MockHttpHandler();
    mockHandler.method = HttpMethod.GET;
    mockHandler.urlRegex = /^\/static\/.*$/;
    mockHandler.error = newInternalError('Reject handle.');
    router.addHandler(mockHandler);

    // Execute
    await mockHttpServer.triggerEvent();

    // Verify
    assert(mockResponse.statusCode === 500);
    assertContains(mockResponse.endData, 'Reject handle.');
    assert(mockHandler.handled);
  }
}

class NotFound implements TestCase {
  public name = 'NotFound';

  public async execute() {
    // Prepare
    let mockRequest = {url: '/file', method: 'get'};
    let mockResponse = new MockResponse();
    let mockHttpServer = new MockHttpServer();
    mockHttpServer.request = mockRequest;
    mockHttpServer.response = mockResponse;
    let router = new Router('any hostname', mockHttpServer as any);
    let mockHandler = new MockHttpHandler();
    mockHandler.method = HttpMethod.GET;
    mockHandler.urlRegex = /^\/static\/.*$/;
    router.addHandler(mockHandler);

    // Execute
    await mockHttpServer.triggerEvent();

    // Verify
    assert(mockResponse.statusCode === 500);
    assertContains(mockResponse.endData, 'Not Found');
    assert(!mockHandler.handled);
  }
}

runTests('RouterTest', [
  new MatchHandler(),
  new RejectHandler(),
  new NotFound(),
]);
