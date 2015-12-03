var Router = require('../router.js');

var secret_key = 'blKNv0912zvSfvpsmbzm=v_xvikmv1ncvf9zMFx81mvizxlkOV7jnbs_=_=MM1Qp';
var dispatcher = new Router();
dispatcher.enableSecureCookieSession(secret_key);
dispatcher.setStatic('/static', './test/static');
dispatcher.setTemplateDir('./test/static');
dispatcher.listen(80);

dispatcher.get(/^\/$/, function(request, response) {
    console.log(request.pathname);
    console.log(request.params);
    console.log(dispatcher.getCookie(request, 'test'))
    var session = dispatcher.getSession(request);
    session.test = '123123';
    session.keep = true;
    console.log(session);
    dispatcher.render(response, 'index.html');
    dispatcher.saveSession(response, session);
});

dispatcher.get(/^\/test$/, function(request, response) {
    dispatcher.setCookie(response, 'test', '=xcv=');
    dispatcher.render(response, 'test.html');
});

dispatcher.get('/test2', function(request, response) {
    console.log('hahah');
    dispatcher.render(response, 'test.html');
});

dispatcher.post('/upload', function(request, response) {
    console.log(request.content_type);
    console.log(request.body);
    dispatcher.redirect(response, '/');
});