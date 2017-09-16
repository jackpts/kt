const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('styles/[name].css');
const extractSass = new ExtractTextPlugin({
    filename: "styles/[name].css",
    disable: process.env.NODE_ENV === "development"
});
let WebpackNotifierPlugin = require('webpack-notifier');
let webpack = require('webpack');

const config = {
    entry: {
        app: __dirname + '/web/assets/client/js/index.jsx'
    },
    output: {
        publicPath: '/assets/build/',
        path: __dirname + '/web/assets/build/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            { test: /\.css$/i, loader: extractCSS.extract(['css-loader']) },
            {
                test: /\.scss$/i,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
            { test: require.resolve('jquery'), loader: 'expose?$!expose?jQuery' },
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                //loaders: ['react-hot-loader', 'babel-loader'],
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            { test: /\.json$/, loader: 'json-loader' }

        ]
    },
    plugins: [
        extractCSS,
        extractSass,
        new WebpackNotifierPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            _: 'lodash',
            $: 'jquery'
        })
    ]
};

const devBuild = process.env.NODE_ENV !== 'production';
if(devBuild) {
    console.log('Webpack dev build');
    config.devtool = 'eval-source-map';
} else {
    console.log('Webpack PROD build');
    config.plugins.push(
        new webpack.optimize.DedupePlugin()
    );
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
}

module.exports = config;