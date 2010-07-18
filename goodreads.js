var http = require('http');
var config = require('./config');
var querystring = require('querystring');
var goodreads = http.createClient(80, 'www.goodreads.com');

function request(url, args, callback){
    var req = goodreads.request('GET', build_path(url, args), {'host': 'www.goodreads.com'});
    req.end();
    req.addListener('response', function(response){
            response.addListener('data', callback);
    }); 
}

function build_path(url, args){
    var query = querystring.stringify(args);
    if(query){
        url = url+'?';
    }
    return url + query; 
}

function typecast(node){

}

exports.shelves = {};
exports.shelves.list = function(user_id, page, callback){
    request('/shelf/list',
            {'format': 'xml',
             'key': config.key,
             'user_id': user_id,
             'page': page}, 
             callback);
};