"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var http = require("http");
var https = require("https");
var url = require("url");
var common_1 = require("./common");
var errors_1 = require("./errors");
var logger_1 = require("./logger");
// TODO: Rate limit requests.
var Router = /** @class */ (function () {
    function Router(hostname, httpServer, httpsServer) {
        this.hostname = hostname;
        this.httpServer = httpServer;
        this.httpsServer = httpsServer;
        this.handlers = [];
    }
    Router.prototype.init = function () {
        var _this = this;
        if (this.httpsServer) {
            this.httpServer.addListener('request', function (request, response) { return _this.redirectToHttps(request, response); });
            this.httpsServer.addListener('request', function (request, response) { return _this.handle(request, response); });
        }
        else {
            this.httpServer.addListener('request', function (request, response) { return _this.handle(request, response); });
        }
    };
    Router.prototype.redirectToHttps = function (request, response) {
        var _a;
        logger_1.LOGGER.info("Redirecting to " + (Router.HTTPS_PROTOCAL + this.hostname + request.url) + ".");
        response.setHeader(Router.ALLOW_ORIGIN_HEADER, '*');
        response.setHeader(Router.ALLOW_METHODS_HEADER, '*');
        response.setHeader(Router.ALLOW_HEADERS_HEADER, '*');
        response.writeHead(Router.REDIRECT_CODE, (_a = {}, _a[Router.LOCATION_HEADER] = this.hostname + request.url, _a));
        response.end();
    };
    Router.prototype.handle = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var randomId, logContext, httpResponse, error_1, readStream_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        randomId = Math.floor(Math.random() * Router.REQUEST_ID_RANDOM_MAX);
                        logContext = "Request " + Date.now() + "-" + randomId + ": ";
                        response.setHeader(Router.ALLOW_ORIGIN_HEADER, '*');
                        response.setHeader(Router.ALLOW_METHODS_HEADER, '*');
                        response.setHeader(Router.ALLOW_HEADERS_HEADER, '*');
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dispatch(logContext, request)];
                    case 2:
                        httpResponse = _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        logger_1.LOGGER.error(logContext + error_1.stack);
                        if (error_1.errorType) {
                            response.writeHead(error_1.errorType, (_a = {}, _a[Router.CONTENT_TYPE_HEADER] = common_1.CONTENT_TYPE_TEXT, _a));
                        }
                        else {
                            response.writeHead(errors_1.ErrorType.INTERNAL, (_b = {}, _b[Router.CONTENT_TYPE_HEADER] = common_1.CONTENT_TYPE_TEXT, _b));
                        }
                        response.end(error_1.message);
                        return [2 /*return*/];
                    case 4:
                        response.writeHead(Router.OK_CODE, (_c = {}, _c[Router.CONTENT_TYPE_HEADER] = httpResponse.contentType, _c));
                        if (!httpResponse.contentFile) {
                            response.end(httpResponse.content);
                        }
                        else {
                            readStream_1 = fs.createReadStream(httpResponse.contentFile);
                            readStream_1.on('error', function (err) {
                                logger_1.LOGGER.error(logContext + err.stack);
                                response.end();
                            });
                            readStream_1.on('close', function () {
                                logger_1.LOGGER.info(logContext + ("File, " + httpResponse.contentFile + ", was closed."));
                                response.end();
                            });
                            response.on('error', function (err) {
                                logger_1.LOGGER.error(logContext + err.stack);
                                readStream_1.close();
                            });
                            response.on('close', function () {
                                logger_1.LOGGER.info(logContext + 'Response closed.');
                                readStream_1.close();
                            });
                            readStream_1.pipe(response);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Router.prototype.dispatch = function (logContext, request) {
        return __awaiter(this, void 0, void 0, function () {
            var method, parsedUrl, i, handler;
            return __generator(this, function (_a) {
                method = request.method.toUpperCase();
                parsedUrl = url.parse(request.url);
                logger_1.LOGGER.info(logContext
                    + "Request received:\n"
                    + ("pathname: " + parsedUrl.pathname + "\n")
                    + ("method: " + method));
                for (i = 0; i < this.handlers.length; i++) {
                    handler = this.handlers[i];
                    if (method === common_1.HttpMethod[handler.method] && parsedUrl.pathname.match(handler.urlRegex)) {
                        logger_1.LOGGER.info(logContext + ("Handler " + i + " matched request with [" + handler.urlRegex + ", " + handler.method + "]."));
                        return [2 /*return*/, handler.handle(logContext, request, parsedUrl)];
                    }
                }
                throw errors_1.newInternalError("404 Not Found :/");
            });
        });
    };
    Router.prototype.start = function () {
        this.httpServer.listen(Router.HTTP_PORT);
        logger_1.LOGGER.info("Http server started at " + Router.HTTP_PORT + ".");
        if (this.httpsServer) {
            this.httpsServer.listen(Router.HTTPS_PORT);
            logger_1.LOGGER.info("Https server started at " + Router.HTTPS_PORT + ".");
        }
    };
    Router.prototype.addHandler = function (httpHandler) {
        this.handlers.push(httpHandler);
    };
    Router.HTTP_PORT = 80;
    Router.HTTPS_PORT = 443;
    Router.CONTENT_TYPE_HEADER = 'Content-Type';
    Router.ALLOW_ORIGIN_HEADER = 'Access-Control-Allow-Origin';
    Router.ALLOW_METHODS_HEADER = 'Access-Control-Allow-Methods';
    Router.ALLOW_HEADERS_HEADER = 'Access-Control-Allow-Headers';
    Router.LOCATION_HEADER = 'Location';
    Router.REDIRECT_CODE = 301;
    Router.OK_CODE = 200;
    Router.REQUEST_ID_RANDOM_MAX = 10000;
    Router.HTTPS_PROTOCAL = 'https://';
    return Router;
}());
exports.Router = Router;
var RouterFactory = /** @class */ (function () {
    function RouterFactory() {
    }
    RouterFactory.prototype.get = function (hostname, httpsOption) {
        var httpServer = http.createServer();
        var httpsServer = undefined;
        if (httpsOption) {
            httpsServer = https.createServer(httpsOption);
        }
        var router = new Router(hostname, httpServer, httpsServer);
        router.init();
        return router;
    };
    return RouterFactory;
}());
exports.RouterFactory = RouterFactory;
exports.ROUTER_FACTORY = new RouterFactory();
//# sourceMappingURL=router.js.map