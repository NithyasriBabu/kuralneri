// eslint.config.js
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    // This replaces "extends": ["expo"]
    rules: {
      // Your custom rules here
    },
  },
  {
    ignores: ['node_modules/', '.expo/', 'dist/'],
  },
];
