var sys = require('sys');
var connect = require('connect');
var app = require('express').createServer(
        connect.staticProvider(__dirname + '/static')
);
var goodreads = require('./goodreads');
var data = require('./data').books;

app.configure(function(){
        app.set('root', __dirname);
});

app.get('/', function(req, res){
        res.render('index.haml', { locals: data });
});

function to_simple_booklist(result){
    var books = [];
    var data = result.results;
    for(var i in data){
        result = data[i].best_book;
        books.push({ title: result.title,
                     author: result.author.name,
                     img: result.small_image_url,
                     id: result.id,
                     recommender: ""});
    }
    return books;
}

app.get('/search', function(req, res){
    try {
        var write = function(result){
            res.render('search.haml', {locals: {results: to_simple_booklist(result)}, layout: false});
        };
        goodreads.search(req.param('q'), 1, req.param('type'), write);
    } catch(e){
        res.writeHead(500, {});
        res.end(e.toString());
    }
});

app.get('/goodreads', function(req, res){
    var write = function(result){
        res.render('search.haml', {locals: {results: to_simple_booklist(result)}});
    };
    //goodreads.shelves.list('2003928-thomas', 1, function(result){res.send(result, {'Content-Type': 'text/plain'});})
    goodreads.search('Escher', 1, 'all', write);
});

app.listen(3000);
