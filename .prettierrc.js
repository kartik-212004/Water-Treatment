module.exports = {
  bracketSpacing: true,
  bracketSameLine: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "es5",
  semi: true,
  printWidth: 110,
  arrowParens: "always",
  endOfLine: "auto",
  importOrder: [
    "(.*)/__mocks__/(.*)",
    "^(react|next|@testing-library|vitest|jest)(.*)",
    "<THIRD_PARTY_MODULES>",
    "^@/lib/(.*)$",
    "^@/components/(.*)$",
    "^@/utils/(.*)$",
    "^@/hooks/(.*)$",
    "^@/types/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: ["**/*.md", "**/*.mdx"],
      options: {
        printWidth: 80,
        proseWrap: "always",
      },
    },
    {
      files: ["**/*.json"],
      options: {
        printWidth: 80,
      },
    },
  ],
};
