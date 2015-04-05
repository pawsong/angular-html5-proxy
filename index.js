'use strict';

var url = require('url'),
    Promise = require('bluebird'),
    modRewrite = require('connect-modrewrite'),
    httpProxy = require('http-proxy');

exports = module.exports = function (options) {

  if (!options || typeof options !== 'object') {
    throw new Error('options object must be given');
  }
 
  if (!options.target || typeof options.target !== 'string') {
    throw new Error('options.target must be a string');
  }

  if (/^(http|https):\/\//.test(options.target) === false) {
    throw new Error('options.target must start with http:// or https://');
  }

  var target = url.parse(options.target);

  var rewriter = Promise.promisify(modRewrite([
    '^[^\\.]*$ /index.html [L]'
  ]));
 
  var proxy = httpProxy.createProxyServer({
    target: target.href
  });

  var proxyWeb = Promise.promisify(proxy.web, proxy);
 
  return function (req, res, next) {

    rewriter(req, res).then(function () {
      return proxyWeb(req, res); 
    }).then(next, next);
  };
};
