import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";
import { AppDataSource } from "../db-connection.js";
import { enrollmentRepository } from "../repository/enrollment.repository.js";
import { User, Course, Topic, Enrollment } from "../entities/index.js";

describe("enrollmentRepository (integration)", () => {
  let userId: string;
  let courseId: string;

  beforeAll(async () => {
    await TestDataSource.initialize();
    Object.assign(AppDataSource, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.query(`TRUNCATE TABLE enrollments, courses, users, topics CASCADE`);
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.query(`TRUNCATE TABLE enrollments, courses, users, topics CASCADE`);

    // Seed topic
    const topicRepo = TestDataSource.getRepository(Topic);
    const topic = await topicRepo.save(topicRepo.create({ name: "Test Topic" }));

    // Seed instructor
    const userRepo = TestDataSource.getRepository(User);
    const instructor = await userRepo.save(
      userRepo.create({ name: "Instructor", email: "instructor@test.com", password: "x", role: "INSTRUCTOR" })
    );

    // Seed student
    const student = await userRepo.save(
      userRepo.create({ name: "Student", email: "student@test.com", password: "x", role: "STUDENT" })
    );
    userId = student.id;

    // Seed course
    const courseRepo = TestDataSource.getRepository(Course);
    const course = await courseRepo.save(
      courseRepo.create({ title: "Test Course", price: 99, topic, instructor })
    );
    courseId = course.id;
  });

  // -------------------------------------------------------------------
  // findEnrollment
  // -------------------------------------------------------------------
  describe("findEnrollment", () => {
    it("should return null when the user is NOT enrolled", async () => {
      const result = await enrollmentRepository.findEnrollment(userId, courseId);
      expect(result).toBeNull();
    });

    it("should return the enrollment when the user IS enrolled", async () => {
      const repo = TestDataSource.getRepository(Enrollment);
      await repo.save(repo.create({ user: { id: userId }, course: { id: courseId } }));

      const result = await enrollmentRepository.findEnrollment(userId, courseId);
      expect(result).not.toBeNull();
      expect(result!.id).toBeDefined();
    });
  });

  // -------------------------------------------------------------------
  // getEnrollmentsByUserId
  // -------------------------------------------------------------------
  describe("getEnrollmentsByUserId", () => {
    it("should return an empty array when the user has no enrollments", async () => {
      const result = await enrollmentRepository.getEnrollmentsByUserId(userId);
      expect(result).toEqual([]);
    });

    it("should return enrollments with course data loaded", async () => {
      const repo = TestDataSource.getRepository(Enrollment);
      await repo.save(repo.create({ user: { id: userId }, course: { id: courseId } }));

      const result = await enrollmentRepository.getEnrollmentsByUserId(userId);
      expect(result).toHaveLength(1);
      expect(result[0].course).toBeDefined();
      expect(result[0].course.id).toBe(courseId);
      expect(result[0].course.title).toBe("Test Course");
    });
  });
});
