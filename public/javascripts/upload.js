var ongoingRequest = null;

function NotificationCenter() {
    this.listeners = {};
    this.addEventListener = function (event, handler, context) {
        if (!(event in this.listeners))
            this.listeners[event] = [];
        this.listeners[event].push({
            handler: handler,
            context: context || this
        });
    };
    this.notify = function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.listeners[event].forEach(function (listener) {
            listener.handler.apply(listener.context, args);
        });
    };
}
var notificationCenter = new NotificationCenter();

$('.upload-btn').on('click', function () {
    if (ongoingRequest) {
        ongoingRequest.abort();
    } else {
        $('#upload-input').click();
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    }
});

$('#upload-input').on('change', function () {
    var files = $(this).get(0).files;

    if (files.length > 0) {
        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploads[]', file, file.name);
        }

        ongoingRequest = $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                notificationCenter.notify('success', data);
            },
            error: function (err, status) {
                notificationCenter.notify('error', err, status);
            },
            xhr: function () {
                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', function (evt) {
                    notificationCenter.notify('progress', evt);
                }, false);

                return xhr;
            }
        });
    }
});

notificationCenter.addEventListener('success', function (text) {
    $('.upload-btn').html('Upload File');
    $('.progress-bar').html('Done');
    ongoingRequest = null;
    console.log('upload successful!\n' + text);
}, this);

notificationCenter.addEventListener('error', function (err, status) {
    $('.upload-btn').html('Upload File');
    $('.progress-bar').width('100%');
    $('.progress-bar').html(status ? status : 'failed');
    $('.progress-bar').css('background-color', 'red');

    ongoingRequest = null;
    console.log('upload fail!\n' + err.statusText + ', ' + err.responseText);
}, this);

notificationCenter.addEventListener('progress', function (evt) {
    if (ongoingRequest)
        $('.upload-btn').text('Cancel');

    if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        percentComplete = parseInt(percentComplete * 100);

        $('.progress-bar').text(percentComplete + '%');
        $('.progress-bar').width(percentComplete + '%');
    }
});
