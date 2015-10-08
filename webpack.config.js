module.exports = {
    entry: "./client/main.js",
    output: {
        path: './public',
        filename: "app.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            {
                 test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },{
                 test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
        ]
    }
};