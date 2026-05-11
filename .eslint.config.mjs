import expo from 'eslint-config-universe/native.js';

export default [
  // Load the Expo/Universe rules
  ...expo,

  // Global Ignores (This replaces .eslintignore)
  {
    ignores: [
      "**/node_modules/**",
      "**/.expo/**",
      "**/dist/**",
      "**/web-build/**",
      "*.config.js",
      "*.config.ts"
    ],
  },

  // Project Settings
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-unused-vars": "warn",
      "react/prop-types": "off",
    },
  },
];