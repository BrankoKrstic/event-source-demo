import postcssPresetEnv from 'postcss-preset-env';

export default {
    plugins: [
        postcssPresetEnv({
            stage: 1,
            browsers: ['> 1% in US', 'last 2 versions', 'not dead']
        })
    ]
};