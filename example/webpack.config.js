var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    bundle: path.join(__dirname, 'src', 'client')
  },
  output: {
    path: path.join(__dirname, '.tmp'),
    filename: "bundle.js"
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel?optional[]=runtime&stage=0'
      }
    ]
  }
};
