const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const baseConfig = require('./webpack.base.config');
const config = {
  plugins: [
    new HtmlWebPackPlugin({
      template: path.join(__dirname,'src','index.html'),
      filename: './index.html'
    }),
    // new MinifyPlugin({}, {
    //   test: /\.js($|\?)/i,
    //   exclude: 'node_modules'
    // }) // 
  ],
  devtool: 'eval-source-map'
};

module.exports = webpackMerge(baseConfig, config);