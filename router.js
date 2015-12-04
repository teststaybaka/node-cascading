var http = require('http');
var https = require('https');
var fs = require('fs');
var querystring = require('querystring');
var stream = require('stream');
var path = require('path');
var crypto = require('crypto');
var FormdataParser = require('./formdataparser.js');

var form_boundary_reg = /^.*boundary=(.*)$/;
var suffix_reg = /^.*\.(.*?)$/;
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": 'image/gif',
    "js": "text/javascript",
    "css": "text/css"
};

Array.prototype.last = function(index) {
    return this[this.length - index];
}

function mkdir(dir, callback) {
    fs.stat(dir, function(error, stats) {
        if (error) {
            mkdir(path.dirname(dir), function() {
                fs.mkdir(dir, 0777, function(error) {
                    if (error) {
                        throw error;
                    } else {
                        callback();
                    }
                });
            });
        } else if (stats.isDirectory()) {
            callback();
        } else {
            throw dir + ' is not a directory.';
        }
    });
}

function getURLPattern(url) {
    if (url instanceof RegExp) {
        return url;
    } else {
        return new RegExp('^'+url+'$');
    }
}

module.exports = function() {
    var self = this;
    var static_dirs = [];
    var rules = [];
    var templateDir = './';
    var useSecureCookieSession = false;
    var secureCookieName = 's_session';
    var algorithm = 'sha256';
    var secret_key;
    var tempfile_dir;
    var session_max_age = 2592000000;
    var fieldname_max = 1024;
    var post_max = 1<<20;
    var post_multipart_max = 2147483648;

    this.dispatcher = function(request, response) {
        //parse url
        var url_parts = request.url.split('?');
        var pathname = url_parts[0];
        var params = {};
        if (url_parts.length === 2) {
            params = querystring.parse(url_parts[1], null, null, {maxKeys: 0});
        }
        request.params = params;
        request.pathname = pathname;

        //match static
        for (var i = 0; i < static_dirs.length; i++) {
            var exp = static_dirs[i].exp;
            var local_pre = static_dirs[i].local_pre;
            var match = pathname.match(exp);
            if (match) {
                var file_path = match.last(1);
                if (file_path.indexOf('..') !== -1) {
                    self.notAllowed(response);
                } else {
                    self.loadStatic(response, local_pre+file_path);
                }
                return;
            }
        }

        //match url rules
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            var match = pathname.match(rule.exp);
            if (match && request.method.toUpperCase() === rule.method) {
                if (rule.method === 'POST') {
                    var content_type_parts = request.headers['content-type'].split(';');
                    var content_type = content_type_parts[0];
                    request.content_type = content_type;
                    if (content_type === 'multipart/form-data' && content_type_parts.length === 2 && form_boundary_reg.test(content_type_parts[1])) {
                        var boundary_str = '--'+content_type_parts[1].match(form_boundary_reg)[1];
                        new FormdataParser(request, boundary_str, tempfile_dir, fieldname_max, post_max, post_multipart_max).parse(function() {
                            rule.callback(request, response, match);
                        }, function(e) {
                            console.log(e);
                            self.notAllowed(response);
                        });

                        response.on('finish', function() {
                            for (name in request.body) {
                                var field = request.body[name];
                                if (field.filename && !field.keep) {
                                    fs.unlink(field.tmp_filepath);
                                }
                            }
                        });
                    } else if (content_type === 'application/x-www-form-urlencoded') {
                        var data_string = '';
                        request.setEncoding('utf8');
                        request.on('data', function(chunk) {
                            data_string += chunk;

                            if (data_string.length > post_max) {
                                self.notAllowed(response);
                                request.destroy();
                            }
                        });

                        request.on('end', function() {
                            request.body = querystring.parse(data_string, null, null, {maxKeys: 0});
                            rule.callback(request, response, match);
                        });
                    } else {
                        var tmp_filepath = tempfile_dir+'tmpfile'+Date.now();
                        var writestream = fs.createWriteStream(tmp_filepath, {defaultEncoding: 'binary'});
                        var size = 0;
                        request.on('data', function(chunk) {
                            size += chunk.length;

                            if (size > post_multipart_max) {
                                self.notAllowed(response);
                                request.destroy();
                                fs.unlink(tmp_filepath);
                            }
                        }).pipe(writestream);

                        writestream.on('finish', function() {
                            request.body = {
                                content_type: content_type,
                                tmp_filepath: tmp_filepath,
                                size: size,
                            }
                            rule.callback(request, response, match);
                        });

                        response.on('finish', function() {
                            var field = request.body;
                            if (!field.keep) {
                                fs.unlink(field.tmp_filepath);
                            }
                        });
                    }
                } else {
                    rule.callback(request, response, match);
                }
                return;
            }
        }

        self.notFound(response);
    }

    this.listen = function(port) {
        self.server.listen(port);
    }

    this.get = function(exp, callback) {
        rules.push({exp: getURLPattern(exp), callback: callback, method: 'GET'});
    }

    this.post = function(exp, callback) {
        rules.push({exp: getURLPattern(exp), callback: callback, method: 'POST'});
    }

    this.put = function(exp, callback) {
        rules.push({exp: getURLPattern(exp), callback: callback, method: 'PUT'});
    }

    this.patch = function(exp, callback) {
        rules.push({exp: getURLPattern(exp), callback: callback, method: 'PATCH'});
    }

    this.delete = function(exp, callback) {
        rules.push({exp: getURLPattern(exp), callback: callback, method: 'DELETE'});
    }

    this.setFieldnameMax = function(max_value) {
        fieldname_max = max_value;
    }

    this.setPostMax = function(max_value) {
        post_max = max_value;
    }

    this.setPostMultipartMax = function(max_value) {
        post_multipart_max = max_value;
    }

    this.setTempfileDir = function(dir) {
        var directory = path.resolve(dir);
        mkdir(directory, function() {
            tempfile_dir = dir+'/';
        });
    }
    this.setTempfileDir('./tmp');

    this.getCookie = function(request, name) {
        if (!request.cookies) {
            request.cookies = {}
            var cookie_parts = [];
            if (request.headers.cookie) {
                cookie_parts = request.headers.cookie.split(';');
            }
            for (var i = 0; i < cookie_parts.length; i++) {
                var cookie_str = cookie_parts[i];
                var index = cookie_str.indexOf('=');
                if (index !== -1) {
                    request.cookies[cookie_str.substring(0, index).trim()] = cookie_str.substring(index+1);
                }
            }
        }
        return request.cookies[name];
    }

    this.setCookie = function(response, name, value, options) {
        var cookie_str = name+'='+value;
        if (options) {
            if (options.path) {
                cookie_str += '; path='+path;
            }
            if (options.max_age) {
                var now = Date.now();
                var expires = new Date(now + options.max_age);
                cookie_str += '; expires='+expires.toGMTString();
            }
        }
        response.setHeader('Set-Cookie', cookie_str);
    }

    this.enableSecureCookieSession = function(secret) {
        useSecureCookieSession = true;
        secret_key = secret;
    }

    this.disableSecureCookieSession = function() {
        useSecureCookieSession = false;
    }

    this.getSession = function(request) {
        if (!useSecureCookieSession) {
            throw 'Secure cookie session is not enabled';
        }

        if (!request.session) {
            var session_value = self.getCookie(request, secureCookieName);
            if (session_value) {
                session_value = decodeURIComponent(session_value);
                var parts = session_value.split('|');
                if (parts.length === 3) {
                    var timestamp = parseInt(parts[1]);
                    if (!isNaN(timestamp) && Date.now() - timestamp < session_max_age) {
                        var signature = crypto.createHmac(algorithm, secret_key)
                                            .update(secureCookieName+'|'+parts[0]+'|'+parts[1])
                                            .digest('hex');

                        if (parts[2] === signature) {
                            request.session = JSON.parse(new Buffer(parts[0], 'base64').toString('utf8'));
                            return request.session;
                        }
                    }
                }
            }
            request.session = {};  
        }
        return request.session;
    }

    this.saveSession = function(response, session_object) {
        if (!useSecureCookieSession) {
            throw 'Secure cookie session is not enabled';
        }
        
        var session_str = new Buffer(JSON.stringify(session_object), 'utf8').toString('base64');
        var timestamp = Date.now();
        var signature = crypto.createHmac(algorithm, secret_key)
                                .update(secureCookieName+'|'+session_str+'|'+timestamp)
                                .digest('hex');

        var options = {path: '/'};
        if (session_object.keep) {
            options.max_age = session_max_age;
        }
        self.setCookie(response, secureCookieName, encodeURIComponent(session_str+'|'+timestamp+'|'+signature), options);
    }

    this.clearSession = function(response) {
        self.setCookie(response, secureCookieName, '', {max_age: 0});
    }

    this.addStatic = function(url_pre, local_pre) {
        var exp = new RegExp('^'+url_pre+'/(.*)$');
        static_dirs.push({exp: exp, local_pre: local_pre+'/'});
    }

    this.loadStatic = function(response, file_path) {
        fs.readFile(file_path, function (err, data) {
            if (err) {
                console.log(err);
                self.notFound(response);
            } else {
                var suffix = file_path.match(suffix_reg);
                if (suffix && (suffix[1] in mimeTypes)) {
                    var mimeType = mimeTypes[suffix[1]];
                    response.writeHead(200, {'Content-Type': mimeType});
                } else {
                    response.writeHead(200, {'Content-Type': 'application/octet-stream'});
                }
                response.end(data);
            }
        });
    }

    this.redirect = function(response, url) {
        response.writeHead(302, {
            'Location': url,
        });
        response.end();
    }

    this.notFound = function(response) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('404 Not Found\n');
    }

    this.notAllowed = function(response) {
        response.writeHead(403, {'Content-Type': 'text/html'});
        response.end('403 Not Allowed\n');
    }

    this.server = http.createServer(this.dispatcher);
};
