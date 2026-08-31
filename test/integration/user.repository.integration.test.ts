import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";

// The repositories call AppDataSource internally.
// We import it and copy TestDataSource's internals into it
// so every repo call goes to the test DB, not the production one.
import { AppDataSource } from "../../src/database/db-connection.js";
import { userRepository } from "../../src/database/repository/user.repository.js";

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

  // -------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------
  describe("update", () => {
    it("should update user properties and return the updated user", async () => {
      const created = await userRepository.createUser({
        name: "Update Me",
        email: "update@example.com",
        password: "pass",
        role: "STUDENT",
      });

      const updated = await userRepository.update(created.id, { name: "Updated Name" });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("Updated Name");
      expect(updated!.email).toBe("update@example.com");
    });
  });

  // -------------------------------------------------------------------
  // createInstructorWithTransaction
  // -------------------------------------------------------------------
  describe("createInstructorWithTransaction", () => {
    it("should create an instructor with PENDING status", async () => {
      const result = await userRepository.createInstructorWithTransaction({
        name: "Instructor 1",
        email: "inst1@example.com",
        password: "pass",
        role: "STUDENT", // should be overridden
      });

      expect(result.role).toBe("INSTRUCTOR");
      expect(result.approvalStatus).toBe("PENDING");
    });

    it("should throw an error if email is already registered", async () => {
      await userRepository.createUser({
        name: "Existing",
        email: "inst2@example.com",
        password: "pass",
        role: "STUDENT",
      });

      await expect(
        userRepository.createInstructorWithTransaction({
          name: "Instructor 2",
          email: "inst2@example.com",
          password: "pass",
          role: "STUDENT",
        })
      ).rejects.toThrow("Email is already registered");
    });
  });

  // -------------------------------------------------------------------
  // findPendingInstructors
  // -------------------------------------------------------------------
  describe("findPendingInstructors", () => {
    it("should return only instructors with PENDING status", async () => {
      const repo = userRepository.getRepository();
      await repo.save(repo.create({
        name: "Approved Inst",
        email: "app@example.com",
        password: "pass",
        role: "INSTRUCTOR",
        approvalStatus: "APPROVED",
      }));

      await userRepository.createInstructorWithTransaction({
        name: "Pending Inst 1",
        email: "pend1@example.com",
        password: "pass",
        role: "INSTRUCTOR",
      });

      const pending = await userRepository.findPendingInstructors();
      expect(pending.length).toBe(1);
      expect(pending[0].email).toBe("pend1@example.com");
    });
  });

  // -------------------------------------------------------------------
  // updateApprovalStatus
  // -------------------------------------------------------------------
  describe("updateApprovalStatus", () => {
    it("should update the approval status of a user", async () => {
      const pending = await userRepository.createInstructorWithTransaction({
        name: "To Approve",
        email: "toapprove@example.com",
        password: "pass",
        role: "INSTRUCTOR",
      });

      const updated = await userRepository.updateApprovalStatus(pending.id, "APPROVED");
      expect(updated).not.toBeNull();
      expect(updated!.approvalStatus).toBe("APPROVED");
    });
  });
});
