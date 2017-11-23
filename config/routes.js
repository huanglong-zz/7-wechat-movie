'use strict'

var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Movie = require('../app/controllers/movie')
var Comment = require('../app/controllers/comment')
var Game = require('../app/controllers/game')
var Wechat = require('../app/controllers/wechat')
var Category = require('../app/controllers/category')
var koaBody = require('koa-body')

module.exports = router => {
  // Index
  router.get('/nodeport', Index.index)

  // User
  router.post('/nodeport/user/signup', User.signup)
  router.post('/nodeport/user/signin', User.signin)
  router.get('/nodeport/signin', User.showSignin)
  router.get('/nodeport/signup', User.showSignup)
  router.get('/nodeport/logout', User.logout)
  router.get('/nodeport/admin/user/list', User.signinRequired, User.adminRequired, User.list)

  // wechat
  router.get('/nodeport/wechat/movie', Game.guess)
  router.get('/nodeport/wechat/movie/:id', Game.find)
  router.get('/nodeport/wechat/jump/:id', Game.jump)
  router.get('/nodeport/wx', Wechat.hear)
  router.post('/nodeport/wx', Wechat.hear)

  // Movie
  router.get('/nodeport/movie/:id', Movie.detail)
  router.get('/nodeport/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new)
  router.get('/nodeport/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)
  router.post('/nodeport/admin/movie', User.signinRequired, User.adminRequired, koaBody({multipart: true}), Movie.savePoster, Movie.save)
  router.get('/nodeport/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
  router.delete('/nodeport/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del)

  // // Comment
  router.post('/nodeport/user/comment', User.signinRequired, Comment.save)

  // // Category
  router.get('/nodeport/admin/category/new', User.signinRequired, User.adminRequired, Category.new)
  router.post('/nodeport/admin/category', User.signinRequired, User.adminRequired, Category.save)
  router.get('/nodeport/admin/category/list', User.signinRequired, User.adminRequired, Category.list)

  // // results
  router.get('/nodeport/results', Index.search)
}
