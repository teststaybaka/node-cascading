import fs = require("fs");
import url = require("url");
import { CONTENT_TYPE_BINARY_STREAM } from "./common";
import { newInternalError } from "./errors";
import { StaticDirHandler, StaticFileHandler } from "./static_handler";
import {
  TestCase,
  assert,
  assertError,
  expectRejection,
  runTests,
} from "./test_base";

class FileHandlerMatchJpgFile implements TestCase {
  public name = "FileHandlerMatchJpgFile";

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler("/url", "path.jpg");

    // Execute
    let response = await handler.handle(undefined, undefined, undefined);

    // Verify
    assert(response.contentFile === "path.jpg");
    assert(response.contentType === "image/jpeg");
  }
}

class FileHandlerBinaryType implements TestCase {
  public name = "FileHandlerBinaryType";

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler("/url", "path");

    // Execute
    let response = await handler.handle(undefined, undefined, undefined);

    // Verify
    assert(response.contentFile === "path");
    assert(response.contentType === CONTENT_TYPE_BINARY_STREAM);
  }
}

class DirHandlerUrlNotMatch implements TestCase {
  public name = "DirHandlerUrlNotMatch";

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler("/xxx", "path");
    let urlPath = url.parse("/xxx");

    // Execute
    let error = await expectRejection(
      handler.handle(undefined, undefined, urlPath)
    );

    // Verify
    assertError(error, newInternalError("match url regex"));
  }
}

class DirHandlerMatchJpgFile implements TestCase {
  public name = "DirHandlerMatchJpgFile";

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler("/xxx", "test_data");
    let urlPath = url.parse("/xxx/test.jpg");

    // Execute
    let response = await handler.handle(undefined, undefined, urlPath);

    // Verify
    let stats = fs.statSync(response.contentFile);
    assert(stats.isFile());
    assert(response.contentType === "image/jpeg");
  }
}

class DirHandlerMatchBinaryFile implements TestCase {
  public name = "DirHandlerMatchBinaryFile";

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler("/xxx", "test_data");
    let urlPath = url.parse("/xxx/file");

    // Execute
    let response = await handler.handle(undefined, undefined, urlPath);

    // Verify
    let stats = fs.statSync(response.contentFile);
    assert(stats.isFile());
    assert(response.contentType === CONTENT_TYPE_BINARY_STREAM);
  }
}

class DirHandlerPreventsParentDirectory implements TestCase {
  public name = "DirHandlerPreventsParentDirectory";

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler("/xxx", "test_data");
    let urlPath = url.parse("/xxx/../../file");

    // Execute
    let error = await expectRejection(
      handler.handle(undefined, undefined, urlPath)
    );

    // Verify
    assertError(error, newInternalError("navigate to the parent directory"));
  }
}

runTests("StaticHttpHandlerTest", [
  new FileHandlerMatchJpgFile(),
  new FileHandlerBinaryType(),
  new DirHandlerUrlNotMatch(),
  new DirHandlerMatchJpgFile(),
  new DirHandlerMatchBinaryFile(),
  new DirHandlerPreventsParentDirectory(),
]);
