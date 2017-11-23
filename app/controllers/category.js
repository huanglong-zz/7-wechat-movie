'use strict'

var mongoose = require('mongoose')
var Category = mongoose.model('Category')

// admin new page
exports.new = function *(next) {
  yield this.render('pages/category_admin', {
    title: 'imooc 后台分类录入页',
    category: {}
  })
}

// admin post movie
exports.save = function *(next) {
  var _category = this.request.body.category
  var category = new Category(_category)

  yield category.save()

  this.redirect('/nodeport/admin/category/list')
}

// catelist page
exports.list = function *(next) {
  var catetories = yield Category.find({}).exec()

  yield this.render('pages/categorylist', {
    title: 'imooc 分类列表页',
    catetories: catetories
  })
}
