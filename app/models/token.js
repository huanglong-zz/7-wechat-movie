'use strict'

var mongoose = require('mongoose')
var TokenSchema = require('../schemas/token')
var Token = mongoose.model('Token', TokenSchema)

module.exports = Token
