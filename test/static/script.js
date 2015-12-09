$(document).ready(function() {
    $("#file-form").submit(function(evt) {
        evt.preventDefault();

        var file = $('#file-input')[0].files[0];
        if (!file) return;

        var oReq = new XMLHttpRequest();
        oReq.open("POST", "/file", true);
        console.log(file.type);
        console.log(file.name);
        oReq.setRequestHeader("Content-Type", file.type);

        oReq.upload.addEventListener("progress", function(evt) {
            console.log('progress', evt.loaded, evt.total);
        });
        oReq.addEventListener("load", function(evt) {
            console.log('Done!');
        });
        oReq.addEventListener("error", function(evt) {
            console.log('error', evt.error);
        });
        oReq.addEventListener("abort", function(evt) {
            console.log('abort');
        });

        oReq.send(file);
    });
});