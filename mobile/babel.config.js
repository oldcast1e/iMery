module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'nativewind/babel',
            'react-native-reanimated/plugin',
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@assets': './assets',
                        '@components': './components',
                        '@services': './services',
                        '@hooks': './hooks',
                        '@constants': './constants',
                        '@utils': './utils',
                    },
                },
            ],
        ],
    };
};
