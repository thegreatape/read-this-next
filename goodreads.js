var sys = require('sys');
var http = require('http');
var config = require('./config').config;
var querystring = require('querystring');
var libxml = require('libxmljs');
var goodreads = http.createClient(80, 'www.goodreads.com');

function request(url, args, cb){
    var req = goodreads.request('GET', build_path(url, args), {'host': 'www.goodreads.com'});
    sys.puts(build_path(url, args));

    req.addListener('response', function(response){
        var buffer = "";
        response.addListener('data', function(chunk, encoding){
            buffer += chunk.toString(encoding);
            sys.puts('chunk');
        });
        response.addListener('end', function(){
            sys.puts('end');
            cb(buffer);
        });
    }); 
    req.end();
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
        if(attr.name()){
            item[attr.name()] = typecast(attr);
        }
    }
    sys.debug(JSON.stringify(item));
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
        // check if subnodes exist, or we're looking at pure text 
        // or cdata children
        for (var i=0; i < children.length; i++){
            var name = children[i].name(); 
            if(! (name === undefined || name == "text")){ // sub-element
                return parse_element(node);
            }
        }
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
        sys.debug("defaulting to text for "+node+"\n but text is "+text );
        return text;
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

exports.reviews = {};
exports.reviews.list = function(user_id, shelf, order, num, sort, query, callback){
    var args = {format: 'xml',
                v: 2,
                id: user_id,
                shelf: shelf,
                page: 1, 
                key: config.key,
                order: order,
                per_page: num,
                sort: sort};
    if(query){
        args.query = query;
    }

    request('/review/list', args, jsonify(callback, 'review'));
};
             
exports.search = function(query, page, field, callback){
    request('/search/search',
            {q: query,
             field: field || 'all',
             page: page || 1,
             key: config.key},
             jsonify(callback, 'work'));
};
