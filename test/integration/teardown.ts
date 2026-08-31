import { TestDataSource } from "./test-data-source.js";

/**
 * globalTeardown — runs ONCE after all integration test suites finish.
 *
 * Drops all tables so the test DB is clean for the next run,
 * then closes the connection.
 */
export default async function globalTeardown() {
  if (TestDataSource.isInitialized) {
    await TestDataSource.dropDatabase(); // wipe all tables
    await TestDataSource.destroy();
    console.log("\n🧹 Test database wiped and connection closed.\n");
  }
}
