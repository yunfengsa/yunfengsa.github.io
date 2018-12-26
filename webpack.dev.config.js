const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const config = {
  plugins: [
    new HtmlWebPackPlugin({
      template: path.join(__dirname,'src','index.html'),
      filename: './index.html'
    }),
  ],
  devtool: 'eval-source-map'
};

module.exports = webpackMerge(baseConfig, config);