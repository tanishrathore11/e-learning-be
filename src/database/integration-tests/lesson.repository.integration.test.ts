import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";
import { AppDataSource } from "../db-connection.js";
import { lessonRepository } from "../repository/lesson.repository.js";
import { Topic, User, Course, Lesson } from "../entities/index.js";

describe("lessonRepository (integration)", () => {
  let courseId: string;

  beforeAll(async () => {
    await TestDataSource.initialize();
    Object.assign(AppDataSource, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.query(`TRUNCATE TABLE lessons, courses, users, topics CASCADE`);
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.query(`TRUNCATE TABLE lessons, courses, users, topics CASCADE`);

    // Seed Topic
    const topicRepo = TestDataSource.getRepository(Topic);
    const topic = await topicRepo.save(topicRepo.create({ name: "IT" }));

    // Seed Instructor
    const userRepo = TestDataSource.getRepository(User);
    const instructor = await userRepo.save(
      userRepo.create({ name: "Instructor", email: "ins@example.com", password: "pwd", role: "INSTRUCTOR" })
    );

    // Seed Course
    const courseRepo = TestDataSource.getRepository(Course);
    const course = await courseRepo.save(
      courseRepo.create({ title: "Python Basics", price: 29.99, topic, instructor })
    );
    courseId = course.id;
  });

  describe("addLesson", () => {
    it("should successfully add a video lesson", async () => {
      const lesson = await lessonRepository.addLesson({
        title: "Intro Video",
        type: "VIDEO",
        videoUrl: "http://youtube.com/my-video",
        position: 1,
        courseId: courseId,
      });

      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBe("Intro Video");
      expect(lesson.type).toBe("VIDEO");
      expect(lesson.videoUrl).toBe("http://youtube.com/my-video");
      expect(lesson.content).toBeNull();
    });

    it("should successfully add a notes lesson", async () => {
      const lesson = await lessonRepository.addLesson({
        title: "Notes Chapter 1",
        type: "NOTES",
        content: "Markdown content here",
        position: 2,
        courseId: courseId,
      });

      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBe("Notes Chapter 1");
      expect(lesson.type).toBe("NOTES");
      expect(lesson.content).toBe("Markdown content here");
      expect(lesson.videoUrl).toBeNull();
    });
  });

  describe("findLessonsByCourseId", () => {
    it("should return lessons ordered by position", async () => {
      await lessonRepository.addLesson({
        title: "Lesson B",
        type: "NOTES",
        position: 2,
        courseId: courseId,
      });

      await lessonRepository.addLesson({
        title: "Lesson A",
        type: "VIDEO",
        position: 1,
        courseId: courseId,
      });

      const lessons = await lessonRepository.findLessonsByCourseId(courseId);
      expect(lessons).toHaveLength(2);
      expect(lessons[0].title).toBe("Lesson A");
      expect(lessons[0].position).toBe(1);
      expect(lessons[1].title).toBe("Lesson B");
      expect(lessons[1].position).toBe(2);
    });
  });

  describe("findById", () => {
    it("should return lesson with course details", async () => {
      const created = await lessonRepository.addLesson({
        title: "Unique Lesson",
        type: "VIDEO",
        position: 1,
        courseId: courseId,
      });

      const found = await lessonRepository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.course).toBeDefined();
      expect(found!.course.id).toBe(courseId);
    });
  });

  describe("updateLesson", () => {
    it("should update fields and clear type-incompatible fields", async () => {
      const created = await lessonRepository.addLesson({
        title: "Video Lesson",
        type: "VIDEO",
        videoUrl: "http://video.url",
        position: 1,
        courseId: courseId,
      });

      // Switch to NOTES, should clear videoUrl
      const updated = await lessonRepository.updateLesson(created.id, {
        title: "Notes Lesson",
        type: "NOTES",
        content: "New content",
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("Notes Lesson");
      expect(updated!.type).toBe("NOTES");
      expect(updated!.content).toBe("New content");
      expect(updated!.videoUrl).toBeNull();
    });

    it("should update and clear content when switching to VIDEO", async () => {
      const created = await lessonRepository.addLesson({
        title: "Notes Lesson",
        type: "NOTES",
        content: "My notes content",
        position: 1,
        courseId: courseId,
      });

      const updated = await lessonRepository.updateLesson(created.id, {
        title: "Video Lesson",
        type: "VIDEO",
        videoUrl: "http://my.video.url",
        position: 3,
        courseId: courseId,
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("Video Lesson");
      expect(updated!.type).toBe("VIDEO");
      expect(updated!.videoUrl).toBe("http://my.video.url");
      expect(updated!.content).toBeNull();
    });
  });

  describe("deleteLesson", () => {
    it("should successfully delete a lesson", async () => {
      const created = await lessonRepository.addLesson({
        title: "To Delete",
        type: "NOTES",
        position: 1,
        courseId: courseId,
      });

      await lessonRepository.deleteLesson(created.id);

      const found = await lessonRepository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
