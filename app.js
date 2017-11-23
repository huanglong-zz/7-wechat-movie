'use strict'

const Koa = require('koa')
const fs = require('fs')
const mongoose = require('mongoose')
const Promise = require('bluebird')
const options = require('./options.json')
const { join } = require('path')

mongoose.Promise = Promise

const dbUrl = 'mongodb://localhost/imooc'

mongoose.connect(dbUrl)

// models loading
var models_path = __dirname + '/app/models'

fs.readdirSync(models_path)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models_path, file)))

var menu = require('./wx/menu')
var wx = require('./wx')
var wechatApi = wx.getWechat()

wechatApi.deleteMenu().then(function() {
  return wechatApi.createMenu(menu)
})
.then(function(msg) {
  console.log('msg', msg)
})

var app = new Koa()
var Router = require('koa-router')
var session = require('koa-session')
var bodyParser = require('koa-bodyparser')
var router = new Router()
var User = mongoose.model('User')
var views = require('koa-views')
var moment = require('moment')

app.use(views(__dirname + '/app/views', {
  extension: 'pug',
  locals: {
    moment: moment
  }
}))

app.keys = ['imooc']
app.use(session(app))
app.use(bodyParser())

app.use(async (ctx, next) => {
  var user = ctx.session.user

  if (user && user._id) {
    ctx.session.user = await User.findOne({_id: user._id}).exec()
    ctx.state.user = ctx.session.user
  }
  else {
    ctx.state.user = null
  }

  await next()
})

require('./config/routes')(router)

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(options.port)
console.log('Listening: ' + options.port)

