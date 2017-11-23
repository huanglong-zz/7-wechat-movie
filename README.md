###环境

> node v7.10.0

因为最新的 node 从 v7.6.0 开始已经支持 async/await 等语法了，所以我们可以放心的直接使用 async/await ，而不需要 babel 等编译

### package
首先需要配置新的 package.json
```javascript
{
  "name": "wechat",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "dependencies": {
    "bcrypt": "^0.8.5",
    "bluebird": "^3.5.0",
    "co": "^4.6.0",
    "ejs": "^2.3.4",
    "express": "^4.13.3",
    "heredoc": "^1.3.1",
    "koa": "^2.2.0",
    "koa-body": "^2.0.1",
    "koa-bodyparser": "^4.2.0",
    "koa-router": "^7.1.1",
    "koa-session": "^5.0.0",
    "koa-views": "^4.1.0",
    "lodash": "^4.17.4",
    "moment": "^2.11.2",
    "mongoose": "^4.9.8",
    "jade": "^1.11.0",
    "raw-body": "^2.1.4",
    "request": "^2.81.0",
    "sha1": "^1.1.1",
    "xml2js": "^0.4.13"
  },
  "devDependencies": {
    "nodemon": "^1.11.0"
  },
  "scripts": {
    "dev": "nodemon -w app.js -w ./app -w ./wx -w ./wechat --exec node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Scott",
  "license": "ISC"
}
```

更新依赖
```
npm i
```

发现没有，这里我们加入一个 npm 的命令
```
...
...
"scripts": {
    "dev": "nodemon -w app.js -w ./app -w ./wx -w ./wechat --exec node app.js",
...
...
```
使用 nodemon 管理服务，在开发的时候可以监听文件的修改，每次监听的文件发生修改并保存之后 *nodemon * 会自动重启服务。所以我们现在启动服务的命令变为
```
npm run dev
```

### Koa2
koa2 最主要的更新是语法上的更新，开始支持 async/await 

先改造原先的 walk 方法

从

```javascript
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)
```

到

```javascript
fs.readdirSync(models_path)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models_path, file)))
```

这里主要是用到 es6 中的箭头函数
```
function fn (a, b) {}   可以简写为  var fn = (a, b) => {}
```
当只传入一个参数的时候，可以不需要括号
当返回的是一行代码的时候，可以不需要加 return， 用 => 直接连接返回函数或值或表达式等即可
这里要注意的是声明变量的顺序问题，以及当返回的是对象字面量,没有其他语句时, 应当用圆括号将其包起来
如:
> () => ({ foo: bar })

koa2 中的 async/await 写法
之前
```javascript
app.use(function *(next) {
  var user = this.session.user

  if (user && user._id) {
    this.session.user = yield User.findOne({_id: user._id}).exec()
    this.state.user = this.session.user
  }
  else {
    this.state.user = null
  }

  yield next
})
```
之后

```javascript
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
```
恩，基本上没什么大的变化，只是传入的参数不同而已，ctx = 原来 koa1 中的 this

改造加密逻辑文件中的 readFileAsync 、createNonce 、createTimestamp 与 writeFileAsync

util.js
```
exports.readFileAsync = function(fpath, encoding) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, encoding, function(err, content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err) {
      if (err) reject(err)
      else resolve()
    })
  })
}

var createNonce = function() {
  return Math.random().toString(36).substr(2, 15)
}

var createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

```

改造之后

```
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs')) //批量构建 fs 的 Promise 方法

const createNonce = () => Math.random().toString(36).substr(2, 15)
const createTimestamp = () => parseInt(new Date().getTime() / 1000, 10) + ''

exports.readFileAsync = (fpath, encoding) => fs.readFileAsync(fpath, encoding)
exports.writeFileAsync = (fpath, content) => fs.writeFileAsync(fpath, content)

```

es6 果然是懒人的好帮手👍

##### request 的全局修改
因为现在 request 现在返回的是 *json*，而不是之前的 *array* ，所以我们要更新掉之前老版本的用法

```
response[1]
```
to
```
response.body
```

### 保存 access_token 到数据库

##### 新建 app/schemas/token.js

```javascript
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

```

加入了两个静态方法 getAccessToken 与 saveAccessToken，这里说明一下，在 es6 中假如我们需要这样一个对象
```
function bar () {}
var foo = {
  bar: bar
}
```
我们可以简写为
```
var bar = () => {}

var foo = {
  bar
}
```


##### 新建 app/models/token.js

```javascript
'use strict'

var mongoose = require('mongoose')
var TokenSchema = require('../schemas/token')
var Token = mongoose.model('Token', TokenSchema)

module.exports = Token

```

wx/index.js

注入
```javascript
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var Token = mongoose.model('Token')
```

> 由于 mongoose 的查询函数并不是 Promise，虽然他有一个 *.then* 的返回函数，这里用 *bluebird* 让他成为一个标准的 Promise

##### 然后修改 wx/index.js 中的 getAccessToken 和 saveAccessToken

```javascript
getAccessToken: async () => await Token.getAccessToken(),
saveAccessToken: async data => await Token.saveAccessToken(data),
```

##### 最后修改 wechat/wechat.js
由于之前 access_token 是保存在文件之中，读取之后需要转换为 *json* 格式，所以现在需要注释掉这几行
```
  fetchAccessToken () {
    var that = this

    return this.getAccessToken()
      .then(function(data) {
        // try {
        //   data = JSON.parse(data)
        // }
        // catch(e) {
        //   return that.updateAccessToken()
        // }

        if (that.isValidAccessToken(data)) {
          return Promise.resolve(data)
        }
        else {
          return that.updateAccessToken()
        }
      })
      .then(function(data) {
        that.saveAccessToken(data)

        return Promise.resolve(data)
      })
  }
```

##### 还有 getTicket 与 saveTicket 可以参照上述，然后自行修改

