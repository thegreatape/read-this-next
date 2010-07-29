var http = require('http');
var config = require('./config');
var querystring = require('querystring');
var goodreads = http.createClient(80, 'www.goodreads.com');
var libxml = require('libxmljs');

function request(url, args, callback){
    var req = goodreads.request('GET', build_path(url, args), {'host': 'www.goodreads.com'});
    req.end();

    var data = "";
    req.addListener('response', function(response){
            response.addListener('data', function(datum){
                data += datum;
            });
            response.addListener('end', function(){callback(data);});
    }); 
}

function build_path(url, args){
    var query = querystring.stringify(args);
    if(query){
        url = url+'?';
    }
    return url + query; 
}

function jsonify(callback){
    return function(xmlstring){
        var data = {shelves: []};
        var doc = libxml.parseXmlString(xmlstring);
        var shelves = doc.find('//user_shelf');
        for(var i in shelves){
            var shelf = {};
            var childNodes = shelves[i].childNodes()
            for(var j in childNodes){
                var attr = childNodes[j];
                shelf[attr.name()] = typecast(attr);
            }
            data.shelves.push(shelf);
        }
        return callback(data);
    };
}

function typecast(node){
    var type = node.attr('type');
    var nil = node.attr('nil');
    var text = node.text();
    if(nil && nil.value() == "true"){
        return null;
    } else if(type){
        var val = type.value();
        if(val == "boolean"){
            return !!(text == "true");
        } else if(val == "integer"){
            return parseInt(text, 10);
        }
    } 

    // default to string value of node
    return text;
}

exports.shelves = {};
exports.shelves.list = function(user_id, page, callback){
    request('/shelf/list',
            {'format': 'xml',
             'key': config.key,
             'user_id': user_id,
             'page': page}, 
             jsonify(callback));
};
