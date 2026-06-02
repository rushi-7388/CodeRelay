import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "dist/**", "build/**", "scripts/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // This repo has legacy code paths; start with non-blocking hygiene.
      // CI will be upgraded to "error" incrementally once the backlog is addressed.
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "warn",
    },
  },
];

