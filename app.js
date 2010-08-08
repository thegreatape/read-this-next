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


app.get('/goodreads', function(req, res){
        var write = function(result){res.send(result, {'Content-Type': 'text/plain'});}
        //goodreads.shelves.list('2003928-thomas', 1, function(result){res.send(result, {'Content-Type': 'text/plain'});})
        goodreads.search('Escher', 1, 'all', write);
});

app.listen(3000);
