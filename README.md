# node-cascading
Yet another web framework written in TypeScript with some toolkit, i.e. singleton factory, unit test framework, and flag parser. It is compiled to ES5.

## Install
```
npm install cascading
```

## Example handler

```typescript
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

```typescript
import { ROUTER_FACTORY } from 'cascading/router';
import { SUB_HANDLER_FACTORY } from './sub_handler';

let router = ROUTER_FACTORY.get('your-hostname.com');
router.addHandler(SUB_HANDLER_FACTORY.get());
```

`logContext` simply contains a random request id for easy log tracking when you prepend it to any subsequent logging. No need to add a space.

## Start router

```typescript
import { ROUTER_FACTORY } from 'cascading/router';

let router = ROUTER_FACTORY.get('your-hostname.com');
// Starts a HTTP server.
router.start();
```

```typescript
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

## Logger

```
import { LOGGER } from 'cascading/logger';

LOGGER.info(...);
LOGGER.warning(...);
LOGGER.error(...);
```

`LOGGER`, also used by `Router`, depends on GCP (Google Cloud Platform) logging lib. It will try to log to GCP all the time as well as log to console, ignoring any error regarding GCP. Internally, it holds a buffer of 100 messages before flushing to GCP, or waits for 30 secs upon receiving the first message.

## Cross-origin request & Preflight handler

This router always allows cross-origin requests from any origin. Depends on client implementation, you might receive an `OPTIONS` request to ask for cross-origin policy. Each router always has a singleton `PreflightHandler` added when created from `ROUTER_FACTORY`. However, it intercepts all `OPTIONS` requests. Thus any handler that handles `OPTIONS` is ignored.

## Static file & directory handler

```typescript
import { STATIC_DIR_HANDLER_FACTORY, STATIC_FILE_HANDLER_FACTORY } from 'cascading/static_handler';

// ...
router.addHandler(STATIC_FILE_HANDLER_FACTORY.get('/favicon.ico', 'image/favicon.ico'));
router.addHandler(STATIC_DIR_HANDLER_FACTORY.get('/image', 'image'));
// ...
```

`STATIC_FILE_HANDLER_FACTORY` takes a URL and a local path. `STATIC_DIR_HANDLER_FACTORY` takes a URL prefix and a local directory.

## SingletonFactory

```typescript
import { SingletonFactory } from 'cascading/singleton_factory';

// ...
export let SUB_HANDLER_FACTORY = new SingletonFactory((): SubHandler => {
  let handler = new SubHandler();
  handler.init();
  return handler;
});
```

`SingletonFactory` takes a function without any argument to construct an instance. It will only call the the constucting function once, no matter what.

## Test base

```typescript
import { TestCase, runTests, assert, assertContains, assertError, expectRejection, expectThrow } from 'cascading/test_base';

// ...
class FileHandlerSuffix implements TestCase {
  public name = 'FileHandlerSuffix';

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler('/url', 'path.js');
    handler.init();

    // Execute
    let response = await handler.handle(undefined, undefined, undefined);

    // Verify
    assert(response.contentFile === 'path.js');
    assert(response.contentType === 'text/javascript');
    assertContains(response.contentType, 'javas');
  }
}
// ...
runTests('StaticHttpHandlerTest', [
  new FileHandlerSuffix(),
  // ...
]);
```

Compile and execute this file normally using `tsc` and `node` to run all tests added in `runTests()`.

To run a single test, use `node test_file.js -- --child=1`, where `child` specifies which test case to run.

In addition, use `expectRejection`, `expectThrow` and `assertError` to test failure cases. Note that `assertError` first asserts the error is an instance of JavaScript `Error`.

```typescript
{
  // Expect rejection from a promise.
  let promise: Promise<any> = ...
  let error = await expectRejection(promise);
  // The message of `error` only needs to contain the message of `expectedError`.
  assertError(error, expectedError);
}

{
  // Expect an error to be thrown when invoking foo().
  let error = expectThrow(() => foo());
  // The message of `error` only needs to contain the message of `expectedError`.
  assertError(error, expectedError);
}
```

## Flag parser

```typescript
import { parseFlags } from 'cascading/flag_parser';

let flags = parseFlags(process.argv);
```

The return value is simply a Map.
