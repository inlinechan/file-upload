function zeroString(length) {
    var result = '';
    for (var i = 0; i < length; ++i)
        result += '0';
    return result;
}

function _nextPath(src) {
    var re = /(.*?)([0-9]*)(\..*)/;
    var m = re.exec(src);

    var length = 4;
    var zeros = zeroString(length);
    var next;
    var number = 0;

    if (m[2].length > 0) {
        length = m[2].length;
        zeros = zeroString(length);
        number = parseInt(m[2]) + 1;
    }
    // http://stackoverflow.com/a/14760377/2229134
    next = (zeros + number).slice(-length);

    return m[1] + next + m[3];
}

function nextPath(src, pred) {
    var path = src;
    while (pred(path)) {
        path = _nextPath(path);
    }
    console.log(src, path);
    return path;
}

var exports = module.exports = {};

exports.nextPath = nextPath;
