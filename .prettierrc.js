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
    // Mocks must be at the top as they contain vi.mock calls
    "(.*)/__mocks__/(.*)",
    // Framework and testing imports
    "^(react|next|@testing-library|vitest|jest)(.*)",
    // Third party modules
    "<THIRD_PARTY_MODULES>",
    // Internal modules (adjust these paths to match your project structure)
    "^@/lib/(.*)$",
    "^@/components/(.*)$",
    "^@/utils/(.*)$",
    "^@/hooks/(.*)$",
    "^@/types/(.*)$",
    "^@/(.*)$",
    // Relative imports
    "^[./]",
  ],
  importOrderSeparation: true,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    /**
     * NOTE: tailwind plugin must come last!
     * @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss#compatibility-with-other-prettier-plugins
     */
    "prettier-plugin-tailwindcss",
  ],
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