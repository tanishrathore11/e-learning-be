import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";
import { AppDataSource } from "../../src/database/db-connection.js";
import { lessonProgressRepository } from "../../src/database/repository/progress.repository.js";
import { Topic, User, Course, Lesson, Enrollment, Progress } from "../../src/database/model/index.js";

describe("lessonProgressRepository (integration)", () => {
  let enrollmentId: string;
  let courseId: string;
  let lessonId: string;

  beforeAll(async () => {
    await TestDataSource.initialize();
    Object.assign(AppDataSource, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.query(`TRUNCATE TABLE progress, lessons, enrollments, courses, users, topics CASCADE`);
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.query(`TRUNCATE TABLE progress, lessons, enrollments, courses, users, topics CASCADE`);

    // Seed Topic
    const topicRepo = TestDataSource.getRepository(Topic);
    const topic = await topicRepo.save(topicRepo.create({ name: "Testing" }));

    // Seed Users
    const userRepo = TestDataSource.getRepository(User);
    const instructor = await userRepo.save(
      userRepo.create({ name: "Inst", email: "inst@test.com", password: "pwd", role: "INSTRUCTOR" })
    );
    const student = await userRepo.save(
      userRepo.create({ name: "Stud", email: "stud@test.com", password: "pwd", role: "STUDENT" })
    );

    // Seed Course
    const courseRepo = TestDataSource.getRepository(Course);
    const course = await courseRepo.save(
      courseRepo.create({ title: "Testing Course", price: 10, topic, instructor })
    );
    courseId = course.id;

    // Seed Lesson
    const lessonRepo = TestDataSource.getRepository(Lesson);
    const lesson = await lessonRepo.save(
      lessonRepo.create({ title: "Lesson 1", type: "VIDEO", course: { id: courseId }, position: 1 })
    );
    lessonId = lesson.id;

    // Seed Enrollment
    const enrollmentRepo = TestDataSource.getRepository(Enrollment);
    const enrollment = await enrollmentRepo.save(
      enrollmentRepo.create({ user: { id: student.id }, course: { id: courseId } })
    );
    enrollmentId = enrollment.id;
  });

  describe("markLessonCompleted", () => {
    it("should successfully mark a lesson as completed", async () => {
      const progress = await lessonProgressRepository.markLessonCompleted(enrollmentId, lessonId);

      expect(progress.id).toBeDefined();
      expect(progress.enrollment).toBeDefined();
      expect(progress.lesson).toBeDefined();

      // Verify that calling it again returns the existing progress record rather than creating a duplicate
      const duplicateProgress = await lessonProgressRepository.markLessonCompleted(enrollmentId, lessonId);
      expect(duplicateProgress.id).toBe(progress.id);

      const count = await TestDataSource.getRepository(Progress).count();
      expect(count).toBe(1);
    });
  });

  describe("getCompletedLessons", () => {
    it("should return completed lessons for a course", async () => {
      // Complete lesson
      await lessonProgressRepository.markLessonCompleted(enrollmentId, lessonId);

      const completed = await lessonProgressRepository.getCompletedLessons(enrollmentId, courseId);
      expect(completed).toHaveLength(1);
      expect(completed[0].lesson.id).toBe(lessonId);
    });

    it("should return empty array if no progress recorded", async () => {
      const completed = await lessonProgressRepository.getCompletedLessons(enrollmentId, courseId);
      expect(completed).toEqual([]);
    });
  });
});
