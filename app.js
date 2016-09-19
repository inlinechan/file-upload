var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

var next_path = require('./next-path.js');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();

    form.multiples = true;
    form.uploadDir = path.join(__dirname, '/uploads');

    var files = {};

    form.on('file', function (field, file) {
        var nextPath = next_path.nextPath(
            path.join(form.uploadDir, file.name),
            function (path) {
                return fs.existsSync(path);
            });
        var oldPath = file.path;
        fs.rename(file.path, nextPath, function (err) {
            if (err)
                console.log('failed to rename' + oldPath + ' to ' + nextPath);
            else
                console.log('successfully renamed ' + oldPath + ' to ' + nextPath);
            delete files[oldPath];
        });
    });
    form.on('fileBegin', function (name, file) {
        files[file.path] = file;
        console.log('fileBegin: ', file.name + ' ' + file.path);
    });
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
        files = null;
    });

    form.on('end', function () {
        console.log('end: ');
        var responseText = "success";
        if (files.length > 0) {
            responseText = "failed to save ";
            var tempFiles = [];
            for (var file in files) {
                var path = file.path;
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path);
                    tempFiles.push(path);
                }
            }
            if (tempFiles.length) {
                responseText += tempFiles.join(', ');
            }
        }
        res.end(responseText);
    });
    // For test
    // form.on('progress', function(bytesReceived, bytesExpected) {
    //     if (bytesReceived > 1 * 1024 * 1024) {
    //         req.socket.end();
    //     }
    // });

    form.parse(req);
});

var server = app.listen(3000, function () {
    console.log('Server listening on port 3000');
});
