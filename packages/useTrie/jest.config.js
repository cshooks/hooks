module.exports = {
  roots: ["."],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  // testRegex: "(/__tests__/**/*.ts?(x),**/?(*.)+(spec|test).ts?(x)",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
  // https://medium.com/@mtiller/debugging-with-typescript-jest-ts-jest-and-visual-studio-code-ef9ca8644132
  // collectCoverage: true
};
