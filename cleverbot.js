// chat
//
// chat <dialog> - chat with hubot via cleverbot

var crypto = require('crypto');
var http = require('http');

var defaultParams = {
    'stimulus'         : '' , 'start'      : 'y'    , 'sessionid' : '',
    'vText8'           : '' , 'vText7'     : ''     , 'vText6' : '',
    'vText5'           : '' , 'vText4'     : ''     , 'vText3' : '',
    'vText2'           : '' , 'icognoid'   : 'wsf'  , 'icognocheck' : '',
    'fno'              : '0', 'prevref'    : ''     , 'emotionaloutput' : '',
    'emotionalhistory' : '' , 'asbotname'  : ''     , 'ttsvoice' : '',
    'typing'           : '' , 'lineref'    : ''     , 'sub' : 'Say',
    'islearning'       : '1', 'cleanslate' : 'false',
};

var parserKeys = [
    'message', 'sessionid', 'logurl', 'vText8',
    'vText7', 'vText6', 'vText5', 'vText4',
    'vText3', 'vText2', 'prevref', '',
    'emotionalhistory', 'ttsLocMP3', 'ttsLocTXT', 'ttsLocTXT3',
    'ttsText', 'lineref', 'lineURL', 'linePOST',
    'lineChoices', 'lineChoicesAbbrev', 'typingData', 'divert'
];

var digest = function(body){
    var hash = crypto.createHash('md5');
    return hash.update(body).digest('hex');
};

var encodeParams = function(params){
    var encodedParams=[];
    for(param in params){
        if(params[param] instanceof Array)
            encodedParams.push(param+"="+encodeURIComponent(params[param].join(",")));
        else if(params[param] instanceof Object)
            encodedParams.push(params(params[param]));
        else
            encodedParams.push(param+"="+encodeURIComponent(params[param]));
    }
    return encodedParams.join("&");
};

var say = function(message, callback){
    var query = defaultParams;
    query.stimulus = message;
    query.icognocheck = digest(encodeParams(query).substring(9,29));
    var options = {
        host: 'www.cleverbot.com',
        port: 80,
        path: '/webservicemin',
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': encodeParams(query).length
        }
    };
    var req = http.request(options, function(res) {
        var cb = callback || function(){};
        res.on('data', function(chunk) {
            var chunk_data = chunk.toString().split("\r")
            var responseHash = {};
            for(var i = 0, iLen = chunk_data.length;i<iLen;i++){
                query[parserKeys[i]] = responseHash[parserKeys[i]] = chunk_data[i];
            }
            cb(responseHash['message']);
        });
    });
    req.write(encodeParams(query));
    req.end();
};

module.exports = function(robot) {
    robot.respond(/chat (.*)/i, function(msg) {
        say(msg.match[1], function(reply){
            msg.send(reply);
        });
    });
};
