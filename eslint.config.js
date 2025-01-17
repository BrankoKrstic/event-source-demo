import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

import {
    defineConfigWithVueTs,
    vueTsConfigs,
} from '@vue/eslint-config-typescript';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...defineConfigWithVueTs(
        pluginVue.configs['flat/essential'],
        vueTsConfigs.recommended,
    ),
    {
        'files': ['client/**/*.vue', 'client/**/*.ts', 'client/**/*.js'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'no-unused-vars': ['error', { 'argsIgnorePattern': '^_'}],
            '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_'}],
            'vue/html-indent': ['error', 4],
            'vue/block-lang': 'off'
        }
    },
    {
        'files': ['server/**/*.ts', 'server.ts'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                'ledgerManager': false
            },
        },
        rules: {
            'no-console': ['warn', { 'allow': ['warn', 'error']}],
        }
    },
    {
        'rules': {
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            'semi': ['error', 'always'],
            '@typescript-eslint/no-unused-vars': ['error', {
                'args': 'all',
                'argsIgnorePattern': '^_',
                'caughtErrors': 'all',
                'caughtErrorsIgnorePattern': '^_',
                'destructuredArrayIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'ignoreRestSiblings': true
            }],
            'quotes': [2, 'single', { 'avoidEscape': true }]
        }
    },
    {
        'ignores': ['build/*']
    }
];