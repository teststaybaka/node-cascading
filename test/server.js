var Router = require('../router.js');

var secret_key = 'blKNv0912zvSfvpsmbzm=v_xvikmv1ncvf9zMFx81mvizxlkOV7jnbs_=_=MM1Qp';
var dispatcher = new Router();
dispatcher.enableSecureCookieSession(secret_key);
dispatcher.addStatic('/static', './test/static');
// dispatcher.setFieldsMax(2);
dispatcher.setPostInMemory(true);
dispatcher.listen(80);

dispatcher.get(/^\/$/, function(request, response) {
    console.log(request.pathname);
    console.log(request.params);
    var session = dispatcher.getSession(request);
    console.log(session);
    session.test = '123123';
    session.keep = true;
    console.log(session);
    dispatcher.loadStatic(response, './test/static/index.html');
    dispatcher.saveSession(response, session);
});

dispatcher.get(/^\/test$/, function(request, response) {
    dispatcher.setCookie(response, 'test', '=xcv=');
    dispatcher.loadStatic(response, './test/static/test.html');
});

dispatcher.get('/file', function(request, response) {
    dispatcher.loadStatic(response, './test/static/file.html');
});

dispatcher.get('/multi', function(request, response) {
    dispatcher.loadStatic(response, './test/static/multifiles.html');
});

dispatcher.post('/file', function(request, response) {
    console.log(request.content_type);
    console.log(request.body);
    request.body.keep = true;
    dispatcher.loadStatic(response, './test/static/file.html');
});

dispatcher.post('/upload', function(request, response) {
    console.log(request.content_type);
    console.log(request.body);
    if (request.body['fileField']) {
        request.body['fileField'][0].keep = true;
    }
    if (request.body['test-field']) {
        request.body['test-field'][0].keep = true;
    }
    dispatcher.redirect(response, '/');
});