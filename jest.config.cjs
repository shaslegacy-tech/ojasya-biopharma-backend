// jest.config.cjs
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  // run tests in serial to reduce memory pressure in local dev
  maxWorkers: 1,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.json",
      // you can customize ts-jest options here
    }]
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "text-summary"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/src/scripts/",
    "/test/helpers/"
  ],
  coverageThreshold: {
  global: {
    branches: 50,
    functions: 40,
    lines: 50,
    statements: 50
  }
},
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"]
};