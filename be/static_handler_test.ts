import fs = require("fs");
import url = require("url");
import { CONTENT_TYPE_BINARY_STREAM } from "../constants";
import { newInternalError } from "../errors";
import { TEST_RUNNER } from "../test_base";
import { assertRejection, assertThat, eq, eqError } from "../test_matcher";
import { StaticDirHandler, StaticFileHandler } from "./static_handler";

TEST_RUNNER.run({
  name: "StaticHttpHandlerTest",
  cases: [
    {
      name: "FileHandlerMatchJpgFile",
      execute: async () => {
        // Prepare
        let handler = new StaticFileHandler("/url", "path.jpg");

        // Execute
        let response = await handler.handle(undefined, undefined, undefined);

        // Verify
        assertThat(
          response.contentFile,
          eq("path.jpg"),
          "response.contentFile"
        );
        assertThat(
          response.contentType,
          eq("image/jpeg"),
          "response.contentType"
        );
      },
    },
    {
      name: "FileHandlerBinaryType",
      execute: async () => {
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
      },
    },
    {
      name: "DirHandlerUrlNotMatch",
      execute: async () => {
        // Prepare
        let handler = new StaticDirHandler("/xxx", "path");
        let urlPath = url.parse("/xxx");

        // Execute
        let error = await assertRejection(
          handler.handle(undefined, undefined, urlPath)
        );

        // Verify
        assertThat(
          error,
          eqError(newInternalError("match url regex")),
          "error"
        );
      },
    },
    {
      name: "DirHandlerMatchJpgFile",
      execute: async () => {
        // Prepare
        let handler = new StaticDirHandler("/xxx", "test_data");
        let urlPath = url.parse("/xxx/test.jpg");

        // Execute
        let response = await handler.handle(undefined, undefined, urlPath);

        // Verify
        let stats = fs.statSync(response.contentFile);
        assertThat(stats.isFile(), eq(true), "isFile");
        assertThat(response.contentType, eq("image/jpeg"), "contentType");
      },
    },
    {
      name: "DirHandlerMatchBinaryFile",
      execute: async () => {
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
      },
    },
    {
      name: "DirHandlerPreventsParentDirectory",
      execute: async () => {
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
      },
    },
  ],
});
