require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
  },
  env: {
    node: true,
  },
  plugins: ["import", "@typescript-eslint"],
  rules: {
    "no-var": 2,
    "no-prototype-builtins": "off",
    "import/newline-after-import": ["error", { count: 1 }],
    "@typescript-eslint/no-var-requires": "off",
    "padding-line-between-statements": [
      "warn",
      {
        blankLine: "always",
        prev: "*",
        next: "return",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "do",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "while",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "if",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "for",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "multiline-expression",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "multiline-block-like",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "try",
      },
      {
        blankLine: "always",
        prev: "*",
        next: "switch",
      },
      {
        blankLine: "always",
        prev: "const",
        next: "*",
      },
      {
        blankLine: "always",
        prev: "let",
        next: "*",
      },
      {
        blankLine: "always",
        prev: "var",
        next: "*",
      },
      {
        blankLine: "any",
        prev: "*",
        next: "const",
      },
      {
        blankLine: "any",
        prev: "*",
        next: "let",
      },
      {
        blankLine: "any",
        prev: "*",
        next: "var",
      },
    ],
    "sort-imports": [
      "error",
      {
        ignoreDeclarationSort: true,
        allowSeparatedGroups: true,
      },
    ],
    "import/order": 2,
  },
};
