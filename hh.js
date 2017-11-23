var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))

var url = 'https://www.housinghand.co.uk/tools/api?type=registration&task=options&key=qf39087sf0jn498sfdn349jJ(*Nd938nuad'

request({
  method: 'POST',
  url: url, 
  body: {
    first_name: 'BIZHENG',
    last_name: 'DONG',
    we_chat: 'codingdream',
    email: 'scott@campusroom.com'
  },
  json: true,
})
.then(function(response) {
  var data = response.body
  console.log(data)
})