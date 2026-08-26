export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  // Only pick up files ending in .integration.test.ts
  testMatch: ["**/*.integration.test.ts"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },

  // Run ONE suite at a time — integration tests share a real DB,
  // parallel runs would cause data races
  maxWorkers: 1,

  // Give DB operations more time than the default 5s
  testTimeout: 30000,
};
