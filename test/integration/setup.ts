import { TestDataSource } from "./test-data-source.js";

/**
 * globalSetup — runs ONCE before all integration test suites.
 *
 * Initializes the TestDataSource which also runs synchronize:true,
 * so all tables are created fresh if they don't exist.
 */
export default async function globalSetup() {
  await TestDataSource.initialize();
  console.log("\n✅ Test database connected and schema synced.\n");
}
