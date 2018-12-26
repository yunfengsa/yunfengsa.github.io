const gulp = require('gulp');
const {src, dest} = gulp;
const webpackstream = require('webpack-stream');
const webpack = require('webpack');
const webpackDevServe = require('webpack-dev-server');
const git = require('gulp-git');

const buildConfig = require('./webpack.product.config');
const devConfig = require('./webpack.dev.config');

const build = function() {
  return src('src/index.js')
  .pipe(webpackstream(buildConfig, webpack))
  .pipe(dest('build/'));
}

const dev = function() {
  // return webpackstream(require('./webpack.config.js'), webpack);
  var compiler = webpack(devConfig);

	new webpackDevServe(compiler, {
    // devServer: {open: true},
    open: true
    // server and middleware options
	}).listen(8080, "localhost", function(err) {
		console.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
	});
}

const publish = function() {
  build();
  git.add();
}
module.exports = {
  dev,
  build,
  publish
}