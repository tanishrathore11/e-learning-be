import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";
import { AppDataSource } from "../../src/database/db-connection.js";
import { topicRepository } from "../../src/database/repository/topic.repository.js";

describe("topicRepository (integration)", () => {
  beforeAll(async () => {
    await TestDataSource.initialize();
    Object.assign(AppDataSource, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.query(`TRUNCATE TABLE topics CASCADE`);
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.query(`TRUNCATE TABLE topics CASCADE`);
  });

  describe("createTopic", () => {
    it("should create a topic and return it with a uuid", async () => {
      const result = await topicRepository.createTopic({ name: "JavaScript" });
      expect(result.id).toBeDefined();
      expect(result.name).toBe("JavaScript");
    });
  });

  describe("getAllTopic", () => {
    it("should return an empty array when no topics exist", async () => {
      const result = await topicRepository.getAllTopic();
      expect(result).toEqual([]);
    });

    it("should return all seeded topics", async () => {
      await topicRepository.createTopic({ name: "JavaScript" });
      await topicRepository.createTopic({ name: "Python" });

      const result = await topicRepository.getAllTopic();
      expect(result).toHaveLength(2);
      const names = result.map((t) => t.name);
      expect(names).toContain("JavaScript");
      expect(names).toContain("Python");
    });
  });

  describe("getTopicById", () => {
    it("should return null for a non-existent id", async () => {
      const result = await topicRepository.getTopicById(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(result).toBeNull();
    });

    it("should return the correct topic by id", async () => {
      const created = await topicRepository.createTopic({ name: "TypeScript" });
      const found = await topicRepository.getTopicById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe("TypeScript");
    });
  });

  describe("findTopicByName", () => {
    it("should return null when name does not match", async () => {
      const result = await topicRepository.findTopicByName("NoSuchTopic");
      expect(result).toBeNull();
    });

    it("should return the topic when name matches exactly", async () => {
      await topicRepository.createTopic({ name: "React" });
      const result = await topicRepository.findTopicByName("React");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("React");
    });
  });
});
