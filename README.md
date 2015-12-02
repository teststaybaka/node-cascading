# node-dispatch
Web dispatcher/router for nodejs with highly efficient file upload support.

## Initialize dispatcher
```javascript
var Dispatcher = require('node-dispatch');
var dispatcher = new Dispatcher();
dispatcher.listen(80);
```
It will start receiving http request only.

## Expose nodejs http server
Access the nodejs http server by `dispatcher.server` to do whatever you want.

## Basic routing
Mapping a url to a handler is done by matching regular expression.  
```javascript
dispatcher.get('/^\/$/', function(request, response, match) {
    // something to do here
});
```

You need to specify a method for each url you want to match.  
```javascript
dispatcher.post('/^\/$/', function(request, response, match) {
    // something to do here
});
dispatcher.put('/^\/$/', function(request, response, match) {
    // something to do here
});
dispatcher.patch('/^\/$/', function(request, response, match) {
    // something to do here
});
dispatcher.delete('/^\/$/', function(request, response, match) {
    // something to do here
});
```
However, the module handles request body for you only on POST request. You may need to deal with the data comes with the other 3 methods.  

Also the order of those routes are important. With multiple matches, the module will pass the request to the first one.  
```javascript
// This will match "/something" first
dispatcher.get('/^\/something$/', function(request, response, match) {
    // something to do here
});

// This matches "/something" as well but will not handle it.
dispatcher.get('/^\/.*$/', function(request, response, match) {
    // something to do here
});
```

Two additional fields are available: `request.pathname` and `request.params`. `request.pathname` is a part of the url, between domain and query string. `request.params` is a dictionary of key-value pairs parsed from query string.

## Cookies
The module parses cookies only when you need it.
```javascript
function handler(request, response) {
    dispatcher.getCookie(request, 'my-cookie-name');
    dispatcher.setCookie(response, 'test-cookie-name', 'value-here')
}
```
You can also set cookie with `dispathcer.setCookie(response, name, value, path, max_age)`. The last two are optional. `path='/'` means available through the whole domain. `max_age` is in milliseconds.  

To delete a cookie, set the `max_age` to `0`.  

## Redirect
The module provides a shortcut to redirect request.  
```javascript
function handler(request, response) {
    dispatcher.redirect(response, '/url/to/redirect');
}
```
Note the reponse is ended with the `redirect` call so don't write more data into response after this.

## Static files
```javascript
dispatcher.setStatic('/static', './static');
```
The first argument is the url prefix for static files request.  
The second one is the corresponding local static file directory.  
Note that the first one will be interpreted as RegExp internally.  

## Template files
```javascript
dispatcher.setTemplateDir('./static');
```
This will setup the template files directory. Later it will be used when you try to use `dispatcher.render` method.  
```javascript
function handler(request, response) {
    dispatcher.render(response, "test.html");
}
```
The render method takes response as the first argument and a template file name as the second. The module will try to file the file name under the template files directory.  

## Post data
The module provides highly efficient multipart/form-data parsing function. To use the parsing result:  
```javascript
dispatcher.post(/^\/upload$/, function(request, response) {
    console.log(request.content_type);
    console.log(request.body);
    
    request.body['username']
    request.body['profile_image'].filename
    request.body['profile_image'].content_type
    request.body['profile_image'].tmp_filepath
    request.body['profile_image'].size
    
    // To check if a field is a file:
    if (request.body['filename'].filename) {
        // is a file
    } else {
        // is not a file
    }

    // some other things to do
});
```
The `request.body` contains all the data parsed from the request. For web forms, it unifies both `application/x-www-form-urlencoded` and `multipart/form-data`.  

But sometimes, you may want to upload raw binary file without any form encoding. Then check the `request.content_type` which is the raw content type in the request headers. If it is either `application/x-www-form-urlencoded` or `multipart/form-data` then, the module parsed the data as a web form. If not, request.body contains the information about the binary file.  
```javascript
dispatcher.post(/^\/upload$/, function(request, response) {
    if (request.content_type !== 'multipart/form-data' && request.content_type !== 'application/x-www-form-urlencoded') {
        request.body.content_type
        request.body.tmp_filepath
        request.body.size
    }
}
```

## Post data size limit


## Temporary directory
Temporary directory is used to store uploaded files. The default is `./tmp`, but you can set it to other directory.
```javascript
dispatcher.setTempfileDir('./temp2');
```
It will throw an error if it failes to create a directory. If you create the directory yourself, make sure the program is able to read and write under it.

## Handles 404 and 403
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