/** @type {import('prettier').Config} */
export default {
    plugins: ['@ianvs/prettier-plugin-sort-imports'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrderCaseSensitive: false,
    importOrder: [
        '^bun',

        '',

        '<BUILTIN_MODULES>', // Node.js built-ins (fs, path, etc. or node:fs)

        '',

        '<THIRD_PARTY_MODULES>', // External dependencies (react, svelte, lodash…)

        '',

        '^[./]', // Relative imports

        '',

        // Type-only imports, following the same group order
        '<TYPES>^(node:)',
        '<TYPES>',
        '<TYPES>^\\$(.*)$',
        '<TYPES>^[./]',
    ],
}
