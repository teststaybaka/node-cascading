import fs = require("fs");
import url = require("url");
import { CONTENT_TYPE_BINARY_STREAM } from "../constants";
import { newInternalError } from "../errors";
import { TestCase, TestSet } from "../test_base";
import { assertRejection, assertThat, eq, eqError } from "../test_matcher";
import { StaticDirHandler, StaticFileHandler } from "./static_handler";

class FileHandlerMatchJpgFile implements TestCase {
  public name = "FileHandlerMatchJpgFile";

  public async execute() {
    // Prepare
    let handler = new StaticFileHandler("/url", "path.jpg");

    // Execute
    let response = await handler.handle(undefined, undefined, undefined);

    // Verify
    assertThat(response.contentFile, eq("path.jpg"), "response.contentFile");
    assertThat(response.contentType, eq("image/jpeg"), "response.contentType");
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
    assertThat(response.contentFile, eq("path"), "response.contentFile");
    assertThat(
      response.contentType,
      eq(CONTENT_TYPE_BINARY_STREAM),
      "response.contentType"
    );
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
    assertThat(error, eqError(newInternalError("match url regex")), "error");
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
    assertThat(stats.isFile(), eq(true), "isFile");
    assertThat(response.contentType, eq("image/jpeg"), "contentType");
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
    assertThat(stats.isFile(), eq(true), "isFile");
    assertThat(
      response.contentType,
      eq(CONTENT_TYPE_BINARY_STREAM),
      "contentType"
    );
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
    assertThat(
      error,
      eqError(newInternalError("navigate to the parent directory")),
      "error"
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
