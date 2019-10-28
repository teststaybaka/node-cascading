# node-cascading
Yet another web framework for nodejs with TypeScript definition.

## Install
```
npm install cascading
```

## Example handler

```TypeScript
import { CONTENT_TYPE_TEXT, HttpMethod } from 'cascading/common';
import { http_handler } from 'cascading/http_handler';

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
```

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
