import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";
import { AppDataSource } from "../../src/database/db-connection.js";
import { courseRepository } from "../../src/database/repository/course.repository.js";
import { Topic, User, Enrollment, Lesson, Progress } from "../../src/database/model/index.js";

describe("courseRepository (integration)", () => {
  let topicId: string;
  let instructorId: string;

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

    // Seed a Topic
    const topicRepo = TestDataSource.getRepository(Topic);
    const topic = await topicRepo.save(topicRepo.create({ name: "Programming" }));
    topicId = topic.id;

    // Seed an Instructor
    const userRepo = TestDataSource.getRepository(User);
    const instructor = await userRepo.save(
      userRepo.create({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        role: "INSTRUCTOR",
      })
    );
    instructorId = instructor.id;
  });

  describe("create", () => {
    it("should successfully create and save a new course", async () => {
      const course = await courseRepository.create({
        title: "TypeScript Basics",
        description: "Learn TypeScript",
        topicId: topicId,
        instructorId: instructorId,
        price: 49.99,
      });

      expect(course.id).toBeDefined();
      expect(course.title).toBe("TypeScript Basics");
      expect(course.price).toBe(49.99);
    });
  });

  describe("findAll", () => {
    it("should return all courses", async () => {
      await courseRepository.create({
        title: "Course 1",
        description: "Desc 1",
        topicId: topicId,
        instructorId: instructorId,
        price: 10,
      });

      await courseRepository.create({
        title: "Course 2",
        description: "Desc 2",
        topicId: topicId,
        instructorId: instructorId,
        price: 20,
      });

      const courses = await courseRepository.findAll();
      expect(courses).toHaveLength(2);
      expect(courses.map(c => c.title)).toContain("Course 1");
      expect(courses.map(c => c.title)).toContain("Course 2");
    });
  });

  describe("findCourseByIdWithDetails", () => {
    it("should return course with topic, instructor, and lessons relations", async () => {
      const created = await courseRepository.create({
        title: "TypeScript Basics",
        description: "Learn TypeScript",
        topicId: topicId,
        instructorId: instructorId,
        price: 49.99,
      });

      // Add a lesson to this course
      const lessonRepo = TestDataSource.getRepository(Lesson);
      await lessonRepo.save(
        lessonRepo.create({
          title: "Introduction",
          type: "VIDEO",
          videoUrl: "http://example.com/video",
          course: { id: created.id },
          position: 1,
        })
      );

      const found = await courseRepository.findCourseByIdWithDetails(created.id);
      expect(found).not.toBeNull();
      expect(found!.topic).toBeDefined();
      expect(found!.topic.name).toBe("Programming");
      expect(found!.instructor).toBeDefined();
      expect(found!.instructor.name).toBe("John Doe");
      expect(found!.lessons).toHaveLength(1);
      expect(found!.lessons[0].title).toBe("Introduction");
    });
  });

  describe("updateCourse", () => {
    it("should update course fields successfully", async () => {
      const created = await courseRepository.create({
        title: "Old Title",
        description: "Old Desc",
        topicId: topicId,
        instructorId: instructorId,
        price: 10,
      });

      const updated = await courseRepository.updateCourse(created.id, {
        title: "New Title",
        description: "New Desc",
        price: 15,
        topicId: topicId,
        instructorId: instructorId,
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("New Title");
      expect(updated!.description).toBe("New Desc");
      expect(Number(updated!.price)).toBe(15);
      expect(updated!.topic.id).toBe(topicId);
      expect(updated!.instructor.id).toBe(instructorId);
    });
  });

  describe("deleteCourse", () => {
    it("should delete the course", async () => {
      const created = await courseRepository.create({
        title: "To Be Deleted",
        description: "Desc",
        topicId: topicId,
        instructorId: instructorId,
        price: 10,
      });

      await courseRepository.deleteCourse(created.id);

      const found = await courseRepository.findCourseByIdWithDetails(created.id);
      expect(found).toBeNull();
    });
  });

  describe("getInstructorDashboard", () => {
    it("should aggregate student progress for instructor courses", async () => {
      // 1. Create Course
      const course = await courseRepository.create({
        title: "JS Course",
        description: "Desc",
        topicId: topicId,
        instructorId: instructorId,
        price: 100,
      });

      // 2. Add two lessons
      const lessonRepo = TestDataSource.getRepository(Lesson);
      const lesson1 = await lessonRepo.save(
        lessonRepo.create({ title: "L1", type: "VIDEO", course: { id: course.id }, position: 1 })
      );
      const lesson2 = await lessonRepo.save(
        lessonRepo.create({ title: "L2", type: "NOTES", content: "Notes content", course: { id: course.id }, position: 2 })
      );

      // 3. Create a student
      const userRepo = TestDataSource.getRepository(User);
      const student = await userRepo.save(
        userRepo.create({ name: "Jane Student", email: "jane@example.com", password: "pwd", role: "STUDENT" })
      );

      // 4. Enroll Student
      const enrollmentRepo = TestDataSource.getRepository(Enrollment);
      const enrollment = await enrollmentRepo.save(
        enrollmentRepo.create({ user: { id: student.id }, course: { id: course.id } })
      );

      // 5. Complete 1 lesson
      const progressRepo = TestDataSource.getRepository(Progress);
      await progressRepo.save(
        progressRepo.create({ enrollment: { id: enrollment.id }, lesson: { id: lesson1.id } })
      );

      // 6. Get dashboard
      const dashboard = await courseRepository.getInstructorDashboard(instructorId);
      expect(dashboard).toHaveLength(1);
      expect(dashboard[0].course_name).toBe("JS Course");
      expect(dashboard[0].student_name).toBe("Jane Student");
      expect(Number(dashboard[0].total_lessons)).toBe(2);
      expect(Number(dashboard[0].completed_lessons)).toBe(1);
    });
  });
});
