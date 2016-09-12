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

    form.on('file', function (field, file) {
        fs.rename(file.path, next_path.nextPath(
            path.join(form.uploadDir, file.name),
            function (path) {
                return fs.existsSync(path);
            }
        ));
    });
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

    form.on('end', function () {
        res.end('success');
    });

    form.parse(req);
});

var server = app.listen(3000, function () {
    console.log('Server listening on port 3000');
});
