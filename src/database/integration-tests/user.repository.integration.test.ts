import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";

// The repositories call AppDataSource internally.
// We import it and copy TestDataSource's internals into it
// so every repo call goes to the test DB, not the production one.
import { AppDataSource } from "../db-connection.js";
import { userRepository } from "../repository/user.repository.js";

describe("userRepository (integration)", () => {
  beforeAll(async () => {
    await TestDataSource.initialize();

    // Point the shared AppDataSource object at the test DB
    Object.assign(AppDataSource, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.query(`TRUNCATE TABLE users CASCADE`);
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.query(`TRUNCATE TABLE users CASCADE`);
  });

  // -------------------------------------------------------------------
  // createUser
  // -------------------------------------------------------------------
  describe("createUser", () => {
    it("should save a user and return it with an auto-generated UUID", async () => {
      const result = await userRepository.createUser({
        name: "Alice",
        email: "alice@example.com",
        password: "hashed-pw",
        role: "STUDENT",
      });

      expect(result.id).toBeDefined();
      expect(result.email).toBe("alice@example.com");
      expect(result.role).toBe("STUDENT");
    });
  });

  // -------------------------------------------------------------------
  // findByEmail
  // -------------------------------------------------------------------
  describe("findByEmail", () => {
    it("should return null when no user has that email", async () => {
      const result = await userRepository.findByEmail("nobody@example.com");
      expect(result).toBeNull();
    });

    it("should return the user when the email matches", async () => {
      await userRepository.createUser({
        name: "Bob",
        email: "bob@example.com",
        password: "hashed-pw",
        role: "INSTRUCTOR",
      });

      const result = await userRepository.findByEmail("bob@example.com");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Bob");
    });
  });

  // -------------------------------------------------------------------
  // findById
  // -------------------------------------------------------------------
  describe("findById", () => {
    it("should return null for a non-existent id", async () => {
      const result = await userRepository.findById(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(result).toBeNull();
    });

    it("should return the correct user by id", async () => {
      const created = await userRepository.createUser({
        name: "Carol",
        email: "carol@example.com",
        password: "hashed-pw",
        role: "ADMIN",
      });

      const found = await userRepository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.email).toBe("carol@example.com");
    });
  });
});
