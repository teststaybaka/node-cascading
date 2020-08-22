import fs = require("fs");
import url = require("url");
import { CONTENT_TYPE_BINARY_STREAM } from "../common";
import { newInternalError } from "../errors";
import { Expectation, TestCase, TestSet, assertRejection } from "../test_base";
import { StaticDirHandler, StaticFileHandler } from "./static_handler";

class FileHandlerMatchJpgFile implements TestCase {
  public name = "FileHandlerMatchJpgFile";

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler("/url", "path.jpg");

    // Execute
    let response = await handler.handle(undefined, undefined, undefined);

    // Verify
    Expectation.expect(response.contentFile === "path.jpg");
    Expectation.expect(response.contentType === "image/jpeg");
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
    Expectation.expect(response.contentFile === "path");
    Expectation.expect(response.contentType === CONTENT_TYPE_BINARY_STREAM);
  }
}

class DirHandlerUrlNotMatch implements TestCase {
  public name = "DirHandlerUrlNotMatch";

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler("/xxx", "path");
    let urlPath = url.parse("/xxx");

    // Execute
    let error = await assertRejection(
      handler.handle(undefined, undefined, urlPath)
    );

    // Verify
    Expectation.expectError(error, newInternalError("match url regex"));
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
    Expectation.expect(stats.isFile());
    Expectation.expect(response.contentType === "image/jpeg");
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
    Expectation.expect(stats.isFile());
    Expectation.expect(response.contentType === CONTENT_TYPE_BINARY_STREAM);
  }
}

class DirHandlerPreventsParentDirectory implements TestCase {
  public name = "DirHandlerPreventsParentDirectory";

  public async execute() {
    // Prepare
    let handler = new StaticDirHandler("/xxx", "test_data");
    let urlPath = url.parse("/xxx/../../file");

    // Execute
    let error = await assertRejection(
      handler.handle(undefined, undefined, urlPath)
    );

    // Verify
    Expectation.expectError(
      error,
      newInternalError("navigate to the parent directory")
    );
  }
}

export let STATIC_HTTP_HANDLER_TEST: TestSet = {
  name: "StaticHttpHandlerTest",
  cases: [
    new FileHandlerMatchJpgFile(),
    new FileHandlerBinaryType(),
    new DirHandlerUrlNotMatch(),
    new DirHandlerMatchJpgFile(),
    new DirHandlerMatchBinaryFile(),
    new DirHandlerPreventsParentDirectory(),
  ],
};
