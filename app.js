/*
* load all the needed node js modules
*/
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie');

var port = process.env.PORT || 3000;
var app = express();
app.locals.moment = require('moment')


/*
 * connect to the localhost mongodb database
 * and print the connection status and information
 * */
mongoose.connect('mongodb://127.0.0.1/imooc');

mongoose.connection.on("error", function (error) {
    console.log("connect to mongodb failure：" + error);
});
mongoose.connection.on("open", function () {
    console.log("------connect to mongodb sucessfully！------");
});

//the path of view files
app.set('views', './views/pages');

//the tempelate engine
app.set('view engine', 'jade');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//the path of bootstrap and jquery 
app.use(express.static(path.join(__dirname, 'public')));

//configure the port and start the listening process
app.listen(port);
console.log('imooc started on port ' + port);
Movie.fetch(function(err,movies){
    console.log("movies length:"+movies.length);
});

/*
* the route of the index page
**/
app.get('/', function (req, res) {
    Movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }

        res.render('index', {
            title: 'movie-site first page',
            movies: movies
        });
    });
});

// Movie list page
app.get('/list', function (req, res) {
    Movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }

        res.render('index', {
            title: 'movie-site list page',
            movies: movies
        });
    });
});

// movie detail page
app.get('/movie/:id', function (req, res) {
    var id = req.params.id;

    Movie.findById(id, function (err, movie) {
        if (err) {
            console.log(err);
        }
        res.render('detail', {
            title: 'movie-site ' + movie.title,
            movie: movie
        });
        return false;
    });
});

// update movie information
app.get('/admin/update/:id', function (req, res) {
    var id = req.params.id;

    if (id) {
        Movie.findById(id, function (err, movie) {
            res.render('admin', {
                title: 'movie information update',
                movie: movie
            });
        });
    }
});

// input page
app.get('/admin/movie', function (req, res) {
    res.render('admin', {
        title: 'movie-site Input Page',
        movie: {
            title: '',
            director: '',
            year: '',
            country: '',
            language: '',
            poster: '',
            flash: '',
            summary: ''
        }
    });
});

// admin list page
app.get('/admin/list', function (req, res) {
    Movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }

        res.render('list', {
            title: 'movie-site list page',
            movies: movies
        });
    });
});




//post new movie data page
app.post('/admin/movie/new', function (req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;
    if (id !== 'undefined') {
        Movie.findById(id, function (err, movie) {
            if (err) {
                console.log(err);
            }

            _movie = _.extend(movie, movieObj);
            _movie.save(function (err, movie) {
                if (err) {
                    console.log(err);
                }

                res.redirect('/movie/' + movie._id);
            });
        });
    } else {
        _movie = new Movie({
            director: movieObj.director,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });

        _movie.save(function (err, movie) {
            if (err) {
                console.log(err);
            }

            res.redirect('/movie/' + movie._id);
        });
    }
});

// delete movie

app.delete('/admin/list', function (req, res) {
    var id = req.query.id;
    if (id){
        console.log("delete Movie id:"+id);
        Movie.remove({_id:id},function(err,movie){
            if (err){
                console.log(err);
            }
            else {
                res.json({success:1})
            }
        });
    }
    else {
        console.log("the movie id is not existed");
    }
});