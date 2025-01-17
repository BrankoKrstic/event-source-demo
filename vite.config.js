import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
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
            }
        }),
        ViteFonts({
            google: {
                families: [ {
                    name: 'Roboto',
                    styles: 'wght@400;700',
                }],
            },
        }),
    ],
    base: '/build/client',
    pubDir: './client/assets'
});