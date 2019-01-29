module.exports = {
  "extends": ["airbnb-base", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": ["error", {"trailingComma": "all", "singleQuote": true}],
    "no-console": "off",
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off",
    "import/no-dynamic-require": "off",
  }
};
