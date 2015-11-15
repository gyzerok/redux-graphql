var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    graphql: path.join(__dirname, 'src', 'client', 'graphql')/*,
    rest: path.join(__dirname, 'src', 'client', 'rest')*/
  },
  output: {
    path: path.join(__dirname, '.tmp'),
    filename: "[name].bundle.js"
  },
  plugins: [
    new webpack.DefinePlugin({
			'__CLIENT__': true
		}),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'src')
    ],
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
