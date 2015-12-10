# node-cascading
A web framework for nodejs with efficient file upload support.

## Install
```
npm install cascading
```

## Initialize dispatcher
```javascript
var Dispatcher = require('cascading');
var dispatcher = new Dispatcher();
dispatcher.listen(80);
```
It will start receiving http request only.

## Expose nodejs http server
Access the nodejs http server by `dispatcher.server` to do whatever you want.

## Basic routing
Mapping a url to a handler is done by matching regular expression. You could provide a RegExp object explicitly or use a string which will be converted into a RegExp laterly.  
```javascript 
dispatcher.get('/url', function(request, response, match) {
    // something to do here
});
// or
dispatcher.get(/^\/url$/, function(request, response, match) {
    // something to do here
});

// This will match "/url2/1", "/url2/2", "/url2/anything"...
dispatcher.get('/url2/.*', function(request, response, match) {
    // something to do here
});
// or
dispatcher.get(/^\/url2\/.*$/, function(request, response, match) {
    // something to do here
});

// This will catch anything within the parenthesis
dispatcher.get('/url3/(.*)', function(request, response, match) {
    match[0] // is the original string
    match[1] // is the catch within the first parenthesis
    // Please check RegExp for more details of how match works
});
// or
dispatcher.get(/^\/url3\/(.*)$/, function(request, response, match) {
    // something to do here
});
```

You need to specify a method for each url you want to match.  
```javascript
dispatcher.post('/', function(request, response, match) {
    // something to do here
});
dispatcher.put('/', function(request, response, match) {
    // something to do here
});
dispatcher.patch('/', function(request, response, match) {
    // something to do here
});
dispatcher.delete('/', function(request, response, match) {
    // something to do here
});
```
However, the module handles request body for you only on POST request. You may need to deal with the data comes with the other 3 methods.  

Also the order of those routes is important. With multiple matches, the module will pass the request to the first one.  
```javascript
// This will match "/something" first
dispatcher.get('/something', function(request, response, match) {
    // something to do here
});

// This matches "/something" as well but will not handle it.
dispatcher.get('/.*', function(request, response, match) {
    // something to do here
});
```

Two additional fields are available for request object: `request.pathname` and `request.params`. `request.pathname` is a part of the url, between domain and query string, which is the target when trying to match your regular expression/url pattern. `request.params` is a dictionary of key-value pairs parsed from query string.  

## Redirect
The module provides a shortcut to redirect request.  
```javascript
function handler(request, response) {
    dispatcher.redirect(response, '/url/to/redirect');
}
```
Note the reponse is ended with the `redirect` call so don't write more data into response after this.  

## Cookies
The module parses cookies only when you need it.
```javascript
function handler(request, response) {
    dispatcher.getCookie(request, 'my-cookie-name');
    dispatcher.setCookie(response, 'test-cookie-name', 'value-here')
}
```
You can also set cookie with `dispathcer.setCookie(response, name, value, options)`. `options` could be a dictonary of options, including `path` and `max_age`. `options.path='/'` means available through the whole domain. `options.max_age` is in milliseconds.  

To delete a cookie, set the `max_age` to `0`.  

Note: For special characters like `=` and `"`, it is recommanded to escape the string yourself before set it in the cookie. For example, use `encodeURIComponent(str)` to encode.  

## Session
The module provides a secured way to store session in cookies. To use it, first enable it with a secret key.  
```javascript
dispatcher.enableSecureCookieSession(secret_key);
```
The `secret_key` could be a 64-bytes length of unguessable string and you should never expose it to others.  

And disable it, which is by default:
```javascript
dispatcher.disableSecureCookieSession();
```

Once enabled, to get, save and clear session:  
```javascript
function handler(request, response) {
    // Don't worry if you haven't created/initialized a session before. getSession() will create an empty session if not find.
    var session = dispatcher.getSession(request);
    
    session.user_id = 123456
    session.keep = true;
    delete session['user_id'];

    dispatcher.saveSession(response, session);
    dispatcher.clearSession(response);
}
```
The `session` you get is essentially a dictionary. Once a user login, you can set his id in the session and save it. Unfortunately, I couldn't figure out a way to save the session automatically, so you have to save it manually if you make any changes.  

`session.keep` is a special mark used to determine whether the session or the cookie should persist when browser closes. Set it to `true` to keep the session.  

More advanced, the time that a session could persist is not infinite. It will expire 30 days later. But it's rare that someone will only come back 30 days later.  

## Static files
```javascript
dispatcher.addStatic('/static', './static');
```
The first argument is the url prefix for static files request. The second one is the corresponding local static file directory. You can add as many static file mapping as you want.   

Note that the first one will be interpreted as RegExp internally.  

You can also return a static file explicitly:  
```javascript
function handler(request, response) {
    dispatcher.loadStatic(response, './static/index.html');
}
```
`loadStatic()` actually respond with the file you specified and ends the `reponse`. No more data can be written into `response` after that. You need to provide the path from your execution root to the file or a full path.  

## Post data
The module provides highly efficient multipart/form-data parsing function. To use the parsing result:  
```javascript
dispatcher.post('/upload', function(request, response) {
    console.log(request.content_type);
    console.log(request.body);
    
    request.body['username']
    request.body['profile_image'][0].filename
    request.body['profile_image'][0].content_type
    request.body['profile_image'][0].tmp_filepath
    request.body['profile_image'][0].size
    
    // To check if a field is a file field:
    if (typeof request.body['file'] !== 'string') {
        // is a file field
    } else {
        // is not a file field
    }

    // some other things to do
});
```
`request.body` contains all the data parsed from the request. For web forms, it unifies both `application/x-www-form-urlencoded` and `multipart/form-data`. Please note that for a file field, the module actually creates a list/array, each element of which is a single file object containing some information about that file. The reason that it has to be a list is because HTML provides a `multiple` attribute for `<input type='file'>`, where you could choose multiple files by holding shift or ctrl.  

Sometimes, you may want to upload a raw binary file without any form encoding. You could check `request.content_type` which is basically the `Content-Type` in the request headers. If it is either `application/x-www-form-urlencoded` or `multipart/form-data` then the module parsed the data as a web form. If not, request.body contains information about the binary file.  
```javascript
dispatcher.post('/upload', function(request, response) {
    if (request.content_type !== 'multipart/form-data' && request.content_type !== 'application/x-www-form-urlencoded') {
        request.body.content_type
        request.body.tmp_filepath
        request.body.size
        // filename is not available here
    }
}
```

## Keep posted files
It's not rare that you want to deal with the file after responding to a request (for example, processing it with a new thread). By default, all temporary files will be removed once you responded.  

To keep a file from removing, simply set `keep` in each file object to be `true`.  
```javascript
function handler(request, response) {
    //...

    // For multipart files
    request.body['profile_image'][0].keep = true;
    
    // For binary file
    request.body.keep = true;

    //...
}
```

## Post data limit
By default, for urlencoded data, the total amout of data that can be received through POST is 1048576 bytes (or 1MB). For multipart and binary file data, the total amount is 2147483648 bytes (or 2GB). Each non-file field can not exceed 1048576 bytes (or 1MB). Field name can not exceed 1024 bytes. And the number of fields can not be larger than 100, including multiple files in one field.  

To change those limits:
```javascript
dispatcher.setFieldnameMax(max_value); // in bytes, 1KB by default
dispatcher.setPostMax(max_value); // in bytes, 1MB by default
dispatcher.setPostMultipartMax(max_value); // in bytes, 2GB by default
dispatcher.setFieldsMax(max_value); // 100 by default
```

## Temporary directory
Temporary directory is used to store uploaded files. The default is `./tmp`, but you can set it to other directory.
```javascript
dispatcher.setTempfileDir('./temp2');
```
It will throw an error if it failes to create a directory. If you create the directory yourself, make sure the program is able to read and write under it.

## Handling 404 and 403
Two default way of handling 404 and 403 are provided when url doesn't match any url pattern, the file requested is not found, or file exceeds size limit, etc. You can as well rewrite them if you want.
```javascript
dispatcher.notFound = function(response) {
    // how to respond to 404?
}

dispatcher.notAllowed = function(response) {
    // how to respond to 403?
}
```
Note the headers of the response are also up to you to fill. Therefore, you could set other response code and you need to set some code yourself.

## Appendix 1: Client side binary file upload script
In case someone wants to upload a binary file but has no idea how to do that in a browser:  
```javascript
$(document).ready(function() {
    // Listen to a form's submit event
    $("#file-form").submit(function(evt) {
        // Disable default submit action for a form.
        evt.preventDefault();

        var file = $('#file-input')[0].files[0];
        // Check if any file is selected.
        if (!file) return;

        var oReq = new XMLHttpRequest();
        // POST to the server. The third param means if it is async or not.
        oReq.open("POST", "/file", true);
        console.log(file.type);
        console.log(file.name);
        oReq.setRequestHeader("Content-Type", file.type);

        // Check the progress of uploading. You can update a progress bar by listening to this event.
        oReq.upload.addEventListener("progress", function(evt) {
            console.log('progress', evt.loaded, evt.total);
        });
        // Once the server responds to the request, load event is fired. So after all, you need to respond.
        oReq.addEventListener("load", function(evt) {
            console.log('Done!');
        });
        oReq.addEventListener("error", function(evt) {
            console.log('error', evt.error);
        });
        oReq.addEventListener("abort", function(evt) {
            console.log('abort');
        });

        // Send the binary file.
        oReq.send(file);
    });
});
```
`$` here refers to `jQuery`.