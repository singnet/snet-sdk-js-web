const webpack = require('webpack');

module.exports = function override(config) {
    let fallback = config.resolve.fallback || {};
    fallback = { ...fallback, 
        fs: false
      };
    Object.assign(fallback, {
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        path: require.resolve('path-browserify'),
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    config.ignoreWarnings = [/Failed to parse source map/];
    config.module.rules.push({
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
            fullySpecified: false,
        },
    });
    return config;
};
