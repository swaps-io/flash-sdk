module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '^[.]{2}',
    '^[.]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  singleAttributePerLine: true,
};
