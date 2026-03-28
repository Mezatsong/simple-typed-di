import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config'; // Use the core helper
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
    // 1. Base ESLint recommended rules
    eslint.configs.recommended,

    // 2. TypeScript recommended rules
    ...tseslint.configs.recommended,

    // 3. Global ignores (Standard flat config object)
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    },

    // 4. Project-specific TS rules
    {
        files: ['**/*.ts', '**/*.mts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
        },
    },

    // 5. Prettier (to disable conflicting stylistic rules)
    eslintConfigPrettier
);
