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
        goodreads.shelves.list('2003928-thomas', 1, function(body){res.send(body, {'Content-Type': 'text/plain'});
    })
});

app.listen(3000);
