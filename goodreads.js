var sys = require('sys');
var http = require('http');
var config = require('./config').config;
var querystring = require('querystring');
var goodreads = http.createClient(80, 'www.goodreads.com');
var libxml = require('libxmljs');

function request(url, args, callback){
    var req = goodreads.request('GET', build_path(url, args), {'host': 'www.goodreads.com'});
    req.end();

    var data = "";
    req.addListener('response', function(response){
            var data = "";
            response.addListener('data', function(chunk){
                data += chunk;
            });
            response.addListener('end', function(){
                callback(data);
            });
    }); 
}

function build_path(url, args){
    var query = querystring.stringify(args);
    if(query){
        url = url+'?';
    }
    return url + query; 
}

function jsonify(callback, tagName){
    return function(xmlstring){
        var doc = libxml.parseXmlString(xmlstring);
        var items = doc.find('//'+tagName),
            start = doc.get('//results-start'),
            end = doc.get('//results-end'),
            total = doc.get('//total-results');

        var result = {
            results: parse_elements(items),
            start: parseInt( start ? start.text() : 0, 10),
            end: parseInt( end ? end.text() : 0, 10),
            total: parseInt( total ? total.text() : 0, 10)
        };
        return callback(result);
    };
}

function parse_element(node){
    var item = {};
    var childNodes = node.childNodes();
    for(var j in childNodes){
        var attr = childNodes[j];
        if(attr.name() != "text"){
            item[attr.name()] = typecast(attr);
        }
    }
    return item;
}

function parse_elements(nodes){
    var data = [];
    for(var i in nodes){
        data.push(parse_element(nodes[i]));
    }
    return data;
}

function typecast(node){
    // check for sub-elements to jsonify
    var children = node.childNodes();
    if(children.length){
        if(children.length == 1 && children[0].name() == "text"){
            // no sub-elements, parse value
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
                } else if(val == "float"){
                    return parseFloat(text, 10);
                }
            } 
            // default to string value of node
            return text;
        } else {
            return parse_element(node);
        }
    }

}

exports.shelves = {};
exports.shelves.list = function(user_id, page, callback) {
    request('/shelf/list',
            {format: 'xml',
             key: config.key,
             user_id: user_id,
             page: page || 1}, 
             jsonify(callback, 'user_shelf'));
};

exports.search = function(query, page, field, callback){
    request('/search/search',
            {q: query,
             field: field || 'all',
             page: page || 1,
             key: config.key},
             jsonify(callback, 'work'));
};
