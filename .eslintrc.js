// .eslintrc.js
module.exports = {
  extends: ['next', 'next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint', 'next'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Add your custom rules here
  },
};
