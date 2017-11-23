'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Token

var TokenSchema = new mongoose.Schema({
  name: String,
  access_token: String,
  expires_in: Number,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// var ObjectId = mongoose.Schema.Types.ObjectId
TokenSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

TokenSchema.statics = {
  async getAccessToken () {
    return await this.findOne({ name: 'access_token' }).exec()
  },
  async saveAccessToken (data) {
    let token = await this.findOne({ name: 'access_token' }).exec()
    if (token) {
      token.access_token = data.access_token
      token.expires_in = data.expires_in
    } else {
      token = new Token({
        name: 'access_token',
        expires_in: data.expires_in,
        access_token: data.access_token
      })
    }

    await token.save()

    return data
  }
}

Token = mongoose.model('Token', TokenSchema)
module.exports = TokenSchema
