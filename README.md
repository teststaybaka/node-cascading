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
router.start(); // Starts a HTTP server.

```

```TypeScript
import { ROUTER_FACTORY } from 'cascading/router';

let router = ROUTER_FACTORY.get('your-hostname.com', {
  key: privateKey,
  cert: certificate,
  ca: [ca...],
});
router.start(); // Starts a HTTP & HTTPS server. Refer to Node's document for HttpsOption.

```

Ports are fixed at 80 for HTTP and 443 for HTTPS.
