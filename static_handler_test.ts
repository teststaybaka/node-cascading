import fs = require('fs');
import url = require('url');
import { CONTENT_TYPE_BINARY_STREAM } from './common';
import { newInternalError } from './errors';
import { TestCase, assert, assertError, expectRejection, runTests } from './test_base';
import { StaticDirHandler, StaticFileHandler } from './static_handler';

class FileHandlerSuffix implements TestCase {
  public name = 'FileHandlerSuffix';

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler('/url', 'path.js');
    handler.init();

    // Execute
    let response = await handler.handle(null, null, null);

    // Verify
    assert(response.contentFile === 'path.js');
    assert(response.contentType === 'text/javascript');
  }
}

class FileHandlerBinaryType implements TestCase {
  public name = 'FileHandlerBinaryType';

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler('/url', 'path');
    handler.init();

    // Execute
    let response = await handler.handle(null, null, null);

    // Verify
    assert(response.contentFile === 'path');
    assert(response.contentType === CONTENT_TYPE_BINARY_STREAM);
  }
}

class DirHandlerUrlNotMatch implements TestCase {
  public name = 'DirHandlerUrlNotMatch';

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler('/xxx', 'path');
    handler.init();
    let urlPath = url.parse('/xxx');

    // Execute
    let error = await expectRejection(handler.handle(null, null, urlPath));

    // Verify
    assertError(error, newInternalError('match url regex'));
  }
}

class DirHandlerMatchJpgFile implements TestCase {
  public name = 'DirHandlerMatchJpgFile';

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler('/xxx', 'test_data');
    handler.init();
    let urlPath = url.parse('/xxx/test.jpg');

    // Execute
    let response = await handler.handle(null, null, urlPath);

    // Verify
    let stats = fs.statSync(response.contentFile);
    assert(stats.isFile());
    assert(response.contentType === 'image/jpeg');
  }
}

class DirHandlerMatchBinaryFile implements TestCase {
  public name = 'DirHandlerMatchBinaryFile';

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler('/xxx', 'test_data');
    handler.init();
    let urlPath = url.parse('/xxx/file');

    // Execute
    let response = await handler.handle(null, null, urlPath);

    // Verify
    let stats = fs.statSync(response.contentFile);
    assert(stats.isFile());
    assert(response.contentType === CONTENT_TYPE_BINARY_STREAM);
  }
}

runTests('StaticHttpHandlerTest', [
  new FileHandlerSuffix(),
  new FileHandlerBinaryType(),
  new DirHandlerUrlNotMatch(),
  new DirHandlerMatchJpgFile(),
  new DirHandlerMatchBinaryFile(),
]);
