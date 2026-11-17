import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import pluginAstro from 'eslint-plugin-astro';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default tseslint.config(
    {ignores: ['dist/**', '.astro/**', '.nuxt/**', '.output/**', '.data/**', 'node_modules/**', 'public/**']},
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    ...pluginAstro.configs['flat/recommended'],
    {
        languageOptions: {globals: {...globals.browser, ...globals.node}},
        rules: {
            // TypeScript vérifie déjà les identifiants non définis
            'no-undef': 'off'
        }
    },
    {
        // Parser global pour JS/TS et Vue
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue']
            }
        }
    },
    // Règles globales JS/TS
    {
        files: ['**/*.{js,mjs,cjs,ts,vue,astro}'],
        rules: {
            // Indentation générale JS à 4 espaces
            'indent': ['error', 4, {
                SwitchCase: 1,
                VariableDeclarator: 1,
                outerIIFEBody: 1,
                MemberExpression: 1,
                FunctionDeclaration: {parameters: 'first'},
                FunctionExpression: {parameters: 'first'},
                CallExpression: {arguments: 'first'},
                ignoredNodes: ['TemplateLiteral']
            }],
            // Point-virgule obligatoire
            'semi': ['error', 'always'],
            // Désactive any explicite et ban-types en TS
            '@typescript-eslint/no-explicit-any': 'off',
            // Nommage des composants Vue
            'vue/component-name-in-template-casing': ['error', 'PascalCase', {
                registeredComponentsOnly: false,
                ignores: []
            }],
            // Gestion des lignes vides
            'no-multiple-empty-lines': ['error', {max: 1, maxEOF: 0, maxBOF: 0}],
            'eol-last': ['error', 'always']
        }
    },
    // Configuration spécifique pour les templates Vue
    {
        files: ['**/*.vue'],
        rules: {
            // Indentation dans les <template> Vue
            'vue/html-indent': ['error', 4, {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: false,
                ignores: []
            }],
            // Un seul attribut par ligne sur plusieurs lignes
            'vue/max-attributes-per-line': ['error', {
                singleline: 1,
                multiline: 1
            }],
            // Règles de mise en forme que la config Nuxt n'imposait pas
            'vue/html-closing-bracket-newline': 'off',
            'vue/html-closing-bracket-spacing': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/multi-word-component-names': 'off'
        }
    },
    // Le frontmatter et le gabarit Astro ont leur propre indentation
    {
        files: ['**/*.astro'],
        rules: {indent: 'off'}
    }
);
