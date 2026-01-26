module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
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
            'react-native-reanimated/plugin',
            'nativewind/babel',
        ],
    };
};
