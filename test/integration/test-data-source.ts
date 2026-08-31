import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Course, Enrollment, Lesson, Progress, PurchaseItem, Purchases, Topic, User } from "../../src/database/model/index.js";

/**
 * A dedicated DataSource for integration tests.
 *
 * Key differences from the production DataSource:
 *  - Reads from .env.test (loaded by dotenv-cli before Jest starts)
 *  - synchronize: true  → TypeORM automatically creates / updates tables
 *    so we never need to run migrations in the test environment
 *  - logging: false     → keeps test output clean
 */
export const TestDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST?.trim(),
  port: Number(process.env.DB_PORT?.trim()),
  username: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),

  synchronize: true, // auto-create tables from entities
  dropSchema: false, // do NOT drop on connect — we control this in teardown
  logging: false,

  entities: [User, Course, Enrollment, Lesson, Progress, PurchaseItem, Purchases, Topic],
});
