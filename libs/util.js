'use strict'

const Promise = require('bluebird')
const crypto = require('crypto')

const fs = Promise.promisifyAll(require('fs'))

const createNonce = () => Math.random().toString(36).substr(2, 15)
const createTimestamp = () => parseInt(new Date().getTime() / 1000, 10) + ''

exports.readFileAsync = async (fpath, encoding) => await fs.readFileAsync(fpath, encoding)
exports.writeFileAsync = async (fpath, content) => await fs.writeFileAsync(fpath, content)

const _sign = (noncestr, ticket, timestamp, url) => {
  let params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]
  let str = params.sort().join('&')
  let shasum = crypto.createHash('sha1')

  shasum.update(str)

  return shasum.digest('hex')
}

exports.sign = (ticket, url) => {
  var noncestr = createNonce()
  var timestamp = createTimestamp()
  var signature = _sign(noncestr, ticket, timestamp, url)

  return {
    noncestr: noncestr,
    timestamp: timestamp,
    signature: signature
  }
}
