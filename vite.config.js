import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import Components from 'unplugin-vue-components/vite';
import ViteFonts from 'unplugin-fonts/vite';


export default defineConfig({
    build: {
        transpile: ['vuetify'],
        outDir: './build/client'

    },
    plugins: [
        vue({
            template: { transformAssetUrls }
        }),
        vuetify({
            autoImport: true,
            styles: {
                configFile: 'client/styles/settings.scss',
            },
        }),
        Components(),
        ViteFonts({
            google: {
                families: [ {
                    name: 'Roboto',
                    styles: 'wght@100;300;400;500;700;900',
                }],
            },
        }),
    ],
    base: '/build/client',
    pubDir: './client/assets'
});