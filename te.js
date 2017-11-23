'use strict'

var Koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
//var config = require('./config');
// var reply = require('./wx/reply');

var appKoa = new Koa();

var ejs = require('ejs');
var heredoc = require('heredoc');

var tpl = heredoc(function (){/*
    <!DOCTYPE html>
    <html>
        <head>
            <title>JACK TEST</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1">
        </head>
        <body>
            <h1>点击测试</h1>
            <p id="title"></p>
            <div id="poster"></div>
            <script src="http://zeptojs.com/zepto-docs.min.js"></script>
            <script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
        </body>
    </html>
*/});

appKoa.use(function *(next) {
    if (this.url.indexOf('/visit') > -1) {
        this.body = ejs.render(tpl, {});

        return next;
    }

    yield next;
});

//appKoa.use(wechat(config.wechat, reply.reply));

appKoa.listen(1234);