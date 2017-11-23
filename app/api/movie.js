'use strict'

var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var co = require('co')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var Category = mongoose.model('Category')
var _ = require('lodash')

// index page
exports.findAll = async () => await Category
  .find({})
  .populate({
    path: 'movies',
    select: 'title poster',
    options: { limit: 6 }
  })
  .exec()

// search page
exports.searchByCategory = async (catId) => await Category
  .find({_id: catId})
  .populate({
    path: 'movies',
    select: 'title poster'
  })
  .exec()

exports.searchByName = async (q) => await Movie
  .find({title: new RegExp(q + '.*', 'i')})
  .exec()

exports.findHotMovies = async (hot, count) => await Movie
  .find({})
  .sort({'pv': hot})
  .limit(count)
  .exec()

exports.findMoviesByCate = async (cat) => await Category
  .findOne({name: cat})
  .populate({
    path: 'movies',
    select: 'title poster _id'
  })
  .exec()

exports.searchById = async (id) => await Movie
  .findOne({_id: id})
  .exec()

const updateMovies = async movie => {
  var options = {
    url: 'https://api.douban.com/v2/movie/subject/' + movie.doubanId,
    json: true
  }

  var response = await request(options)

  var data = JSON.parse(response.body)

  _.extend(movie, {
    country: data.countries[0],
    language: data.language,
    summary: data.summary
  })

  console.log(data)

  var genres = movie.genres

  if (genres && genres.length > 0) {
    var cateArray = []

    genres.forEach(genre => {
      cateArray.push(async () => {
        var cat = await Category.findOne({name: genre}).exec()

        if (cat) {
          cat.movies.push(movie._id)
          await cat.save()
        }
        else {
          cat = new Category({
            name: genre,
            movies: [movie._id]
          })

          cat = await cat.save()
          movie.category = cat._id
          await movie.save()
        }
      })
    })

    Promise.all(cateArray)
  }
  else {
    movie.save()
  }
}

exports.searchByDouban = async (q) => {
  var options = {
    url: 'https://api.douban.com/v2/movie/search?q='
  }

  options.url += encodeURIComponent(q)

  var response = await request(options)
  var data = JSON.parse(response.body)
  var subjects = []
  var movies = []

  if (data && data.subjects) {
    subjects = data.subjects
  }

  if (subjects.length > 0) {
    var queryArray = []

    subjects.forEach(item => {
      queryArray.push(async () => {
        var movie = await Movie.findOne({doubanId: item.id})

        if (movie) {
          movies.push(movie)
        }
        else {
          var directors = item.directors || []
          var director = directors[0] || {}

          movie = new Movie({
            director: director.name || '',
            title: item.title,
            doubanId: item.id,
            poster: item.images.large,
            year: item.year,
            genres: item.genres || []
          })

          movie = await movie.save()
          movies.push(movie)
        }
      })
    })

    await queryArray

    movies.forEach(movie => {
      updateMovies(movie)
    })
  }

  return movies
}
