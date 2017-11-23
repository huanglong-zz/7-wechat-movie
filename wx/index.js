'use strict'

var path = require('path')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var Token = mongoose.model('Token')
var util = require('../libs/util')
var Wechat = require('../wechat/wechat')
var options = require('../options.json')
var wechat_file = path.join(__dirname, '../config/wechat.txt')
var wechat_ticket_file = path.join(__dirname, '../config/wechat_ticket.txt')

var config = {
  wechat: {
    // test
    appID: options.appID,
    appSecret: options.appSecret,
    //appID: 'wx84cf38141b01aea1',
    //appSecret: '5e7edc318456407d476234af5bd26f9b',
    token: options.token,
    getAccessToken: async () => await Token.getAccessToken(),
    saveAccessToken: async data => await Token.saveAccessToken(data),
    getTicket: function() {
      return util.readFileAsync(wechat_ticket_file)
    },
    saveTicket: function(data) {
      data = JSON.stringify(data)

      return util.writeFileAsync(wechat_ticket_file, data)
    }
  }
}

exports.wechatOptions = config

exports.getWechat = function() {
  var wechatApi = new Wechat(config.wechat)

  return wechatApi
}
