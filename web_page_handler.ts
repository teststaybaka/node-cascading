import http = require("http");
import url = require("url");
import { CONTENT_TYPE_HTML, HttpMethod } from "./common";
import { HttpHandler, HttpResponse } from "./http_handler";

export class WebPageHandler implements HttpHandler {
  public urlRegex: RegExp;
  public method = HttpMethod.GET;

  public constructor(urlRegexString: string, private mainScriptUrl: string) {
    this.urlRegex = new RegExp(`^${urlRegexString}$`);
  }

  public handle(
    logContext: string,
    request: http.IncomingMessage,
    parsedUrl: url.Url
  ): Promise<HttpResponse> {
    return Promise.resolve({
      contentType: CONTENT_TYPE_HTML,
      content: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body><script type="text/javascript" src="${this.mainScriptUrl}"></script>
</body><html>`,
    });
  }
}
