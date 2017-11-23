'use strict'

var Movie = require('../api/movie')

// index page
exports.index = function *(next) {
  var categories = yield Movie.findAll()

  yield this.render('pages/index', {
    title: '微信电影课程首页-[imooc]',
    categories: categories
  })
}

// search page
exports.search = function *(next) {
  var catId = this.query.cat
  var q = this.query.q
  var page = parseInt(this.query.p, 10) || 0
  var count = 2
  var index = page * count

  if (catId) {
    var categories = yield Movie.searchByCategory(catId)
    var category = categories[0] || {}
    let movies = category.movies || []
    let results = movies.slice(index, index + count)

    yield this.render('pages/results', {
      title: 'imooc 结果列表页面',
      keyword: category.name,
      currentPage: (page + 1),
      query: 'cat=' + catId,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  }
  else {
    let movies = yield Movie.searchByName(q)
    let results = movies.slice(index, index + count)

    yield this.render('pages/results', {
      title: 'imooc 结果列表页面',
      keyword: q,
      currentPage: (page + 1),
      query: 'q=' + q,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  }
}
