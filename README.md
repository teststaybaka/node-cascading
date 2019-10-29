# node-cascading
Yet another web framework written in TypeScript, with some common util classes/functions.

## Install
```
npm install cascading
```

## Example handler

```TypeScript
// File 'sub_handler.ts'.
import { CONTENT_TYPE_TEXT, HttpMethod } from 'cascading/common';
import { HttpHandler } from 'cascading/http_handler';
import { SingletonFactory } from 'cascading/singleton_factory';

class SubHandler implements HttpHandler {
  public method = HttpMethod.GET;
  public urlRegex: RegExp;

  public init(): void {
    this.urlRegex = /^\/.*$/;
  }

  public handle(logContext: string,  request: http.IncomingMessage, parsedUrl: url.Url): Promise<HttpResponse> {
    return Promise.resolve({
      contentType: CONTENT_TYPE_TEXT,
      content: '<html>...</html>',
    });
  }
}

export let SUB_HANDLER_FACTORY = new SingletonFactory((): SubHandler => {
  let handler = new SubHandler();
  handler.init();
  return handler;
});
```

Then added to router.

```TypeScript
import { ROUTER_FACTORY } from 'cascading/router';
import { SUB_HANDLER_FACTORY } from './sub_handler';

let router = ROUTER_FACTORY.get('your-hostname.com');
router.addHandler(SUB_HANDLER_FACTORY.get());
```

`logContext` simply contains a random request id for easy log tracking when you prepend it to any subsequent logging.

## Start router

```TypeScript
import { ROUTER_FACTORY } from 'cascading/router';

let router = ROUTER_FACTORY.get('your-hostname.com');
// Starts a HTTP server.
router.start();
```

```TypeScript
import { ROUTER_FACTORY } from 'cascading/router';

let router = ROUTER_FACTORY.get('your-hostname.com', {
  key: privateKey,
  cert: certificate,
  ca: [ca...],
});
// Starts a HTTP & HTTPS server. All HTTP requests will be redirected to HTTPS temporarily (Code
// 307). Refer to Node's document for https.ServerOptions.
router.start();
```

Ports are fixed at 80 for HTTP and 443 for HTTPS.

## Cross-origin request & Preflight handler

This router always allows cross-origin requests from any origin. Depends on client implementation, you might receive an `OPTIONS` request to ask for cross-origin policy. You can add `PreflightHandler` to handle this request.

```TypeScript
import { PREFLIGHT_HANDLER_FACTORY } from 'cascading/preflight_handler';

// ...
router.addHandler(PREFLIGHT_HANDLER_FACTORY.get());
// ...
```
