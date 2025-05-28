module.exports = {
  extends: "next/core-web-vitals",
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  }
};
