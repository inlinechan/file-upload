var ongoingRequest = null;

$('.upload-btn').on('click', function () {
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

$('.cancel-btn').on('click', function() {
    ongoingRequest.abort();
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
                $('.progress-bar').html('Done');
                ongoingRequest = null;
                console.log('upload successful!\n' + data);
            },
            error: function (err, status) {
                $('.progress-bar').width('100%');
                $('.progress-bar').html(status ? status : 'failed');
                $('.progress-bar').css('background-color', 'red');

                ongoingRequest = null;
                console.log('upload fail!\n' + err.statusText + ', ' + err.responseText);
            },
            xhr: function () {
                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        $('.progress-bar').text(percentComplete + '%');
                        $('.progress-bar').width(percentComplete + '%');
                    }
                }, false);

                return xhr;
            }
        });
    }
});
