import { courseService } from "./course.service.js";
import { courseRepository } from "../database/repository/course.repository.js";
import { topicRepository } from "../database/repository/topic.repository.js";
import { enrollmentRepository } from "../database/repository/enrollment.repository.js";
import { lessonProgressRepository } from "../database/repository/progress.repository.js";
import { userRepository } from "../database/repository/user.repository.js";
import { purchaseRepository } from "../database/repository/purchase.repository.js";
import { AppError } from "../utils/appError.js";

jest.mock("../database/repository/course.repository.js");
jest.mock("../database/repository/topic.repository.js");
jest.mock("../database/repository/enrollment.repository.js");
jest.mock("../database/repository/progress.repository.js");
jest.mock("../database/repository/user.repository.js");
jest.mock("../database/repository/purchase.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// createCourse
// -------------------------------------------------------------------
describe("courseService.createCourse", () => {
  const validCourseData = {
    title: "JS Basics",
    description: "Learn JS",
    topicId: "topic-1",
    instructorId: "instructor-1",
    price: 99,
    level: "BEGINNER" as const,
  };

  it("should throw 404 AppError if the topic does not exist", async () => {
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue(null);

    await expect(courseService.createCourse(validCourseData)).rejects.toThrow(
      "Topic not found"
    );
    expect(courseRepository.create).not.toHaveBeenCalled();
  });

  it("should throw 404 AppError if the instructor does not exist", async () => {
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue({ id: "topic-1" });
    (userRepository.findById as jest.Mock).mockResolvedValue(null); // no user found

    await expect(courseService.createCourse(validCourseData)).rejects.toThrow(
      "Instructor not found"
    );
  });

  it("should throw 403 AppError if the user is not an INSTRUCTOR or ADMIN", async () => {
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue({ id: "topic-1" });
    (userRepository.findById as jest.Mock).mockResolvedValue({ id: "instructor-1", role: "STUDENT" });

    await expect(courseService.createCourse(validCourseData)).rejects.toThrow(
      "User is not an instructor"
    );
  });

  it("should create and return the course on success", async () => {
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue({ id: "topic-1" });
    (userRepository.findById as jest.Mock).mockResolvedValue({ id: "instructor-1", role: "INSTRUCTOR" });

    const mockCourse = { id: "course-1", title: "JS Basics" };
    (courseRepository.create as jest.Mock).mockResolvedValue(mockCourse);

    const result = await courseService.createCourse(validCourseData);

    expect(courseRepository.create).toHaveBeenCalledWith(validCourseData);
    expect(result).toEqual(mockCourse);
  });
});

// -------------------------------------------------------------------
// getAllCourses
// -------------------------------------------------------------------
describe("courseService.getAllCourses", () => {
  it("should return all courses", async () => {
    const mockCourses = [{ id: "course-1", title: "JS Basics" }];
    (courseRepository.findAll as jest.Mock).mockResolvedValue(mockCourses);

    const result = await courseService.getAllCourses();
    expect(result).toEqual(mockCourses);
    expect(courseRepository.findAll).toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// getCourseById
// -------------------------------------------------------------------
describe("courseService.getCourseById", () => {
  it("should throw 404 AppError if the course does not exist", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue(null);

    await expect(
      courseService.getCourseById("bad-id", "user-1", "STUDENT")
    ).rejects.toThrow("Course not found");
  });

  it("should throw 403 AppError if student is not enrolled and not the instructor", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      lessons: [],
      instructor: { id: "instructor-1" }, // different from userId
    });
    (enrollmentRepository.findEnrollment as jest.Mock).mockResolvedValue(null); // not enrolled

    await expect(
      courseService.getCourseById("course-1", "student-1", "STUDENT")
    ).rejects.toThrow("Access denied. You must purchase this course to view its details");
  });

  it("should return the course with isCompleted flag on each lesson for an enrolled student", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
      lessons: [
        { id: "lesson-1", title: "Intro" },
        { id: "lesson-2", title: "Advanced" },
      ],
    });
    (enrollmentRepository.findEnrollment as jest.Mock).mockResolvedValue({ id: "enrollment-1" });
    // Only lesson-1 is completed
    (lessonProgressRepository.getCompletedLessons as jest.Mock).mockResolvedValue([
      { lesson: { id: "lesson-1" } },
    ]);

    const result = await courseService.getCourseById("course-1", "student-1", "STUDENT");

    expect(result.lessons[0]).toMatchObject({ id: "lesson-1", isCompleted: true });
    expect(result.lessons[1]).toMatchObject({ id: "lesson-2", isCompleted: false });
  });

  it("should allow ADMIN to view course without enrollment", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
      lessons: [],
    });
    (enrollmentRepository.findEnrollment as jest.Mock).mockResolvedValue(null);
    (lessonProgressRepository.getCompletedLessons as jest.Mock).mockResolvedValue([]);

    // Should NOT throw
    await expect(
      courseService.getCourseById("course-1", "admin-1", "ADMIN")
    ).resolves.toBeDefined();
  });
});

// -------------------------------------------------------------------
// updateCourse
// -------------------------------------------------------------------
describe("courseService.updateCourse", () => {
  it("should throw 404 AppError if course does not exist", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue(null);

    await expect(
      courseService.updateCourse("bad-id", { title: "New Title" }, "instructor-1", "INSTRUCTOR")
    ).rejects.toThrow("Course not found");
  });

  it("should throw 403 AppError if user is not the course instructor or ADMIN", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "other-instructor" },
    });

    await expect(
      courseService.updateCourse("course-1", { title: "New Title" }, "user-1", "INSTRUCTOR")
    ).rejects.toThrow("You are not authorized to edit this course");
  });

  it("should throw 404 AppError if new topicId does not exist", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue(null);

    await expect(
      courseService.updateCourse("course-1", { topicId: "bad-topic" }, "instructor-1", "INSTRUCTOR")
    ).rejects.toThrow("Topic not found");
  });

  it("should throw 404 AppError if new instructorId does not exist", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      courseService.updateCourse("course-1", { instructorId: "bad-user" }, "instructor-1", "INSTRUCTOR")
    ).rejects.toThrow("Instructor not found");
  });

  it("should throw 403 AppError if updated instructor is not an instructor or admin", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    (userRepository.findById as jest.Mock).mockResolvedValue({ id: "new-inst", role: "STUDENT" });

    await expect(
      courseService.updateCourse("course-1", { instructorId: "new-inst" }, "instructor-1", "INSTRUCTOR")
    ).rejects.toThrow("User is not an instructor");
  });

  it("should update and return the course on success", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    const mockUpdated = { id: "course-1", title: "New Title" };
    (courseRepository.updateCourse as jest.Mock).mockResolvedValue(mockUpdated);

    const result = await courseService.updateCourse(
      "course-1",
      { title: "New Title" },
      "instructor-1",
      "INSTRUCTOR"
    );

    expect(courseRepository.updateCourse).toHaveBeenCalledWith("course-1", { title: "New Title" });
    expect(result).toEqual(mockUpdated);
  });
});

// -------------------------------------------------------------------
// deleteCourse
// -------------------------------------------------------------------
describe("courseService.deleteCourse", () => {
  it("should throw 404 AppError if course does not exist", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue(null);

    await expect(
      courseService.deleteCourse("bad-id", "instructor-1", "INSTRUCTOR")
    ).rejects.toThrow("Course not found");
  });

  it("should throw 403 AppError if user is not the instructor or ADMIN", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "other-instructor" },
    });

    await expect(
      courseService.deleteCourse("course-1", "user-1", "INSTRUCTOR")
    ).rejects.toThrow("You are not authorized to delete this course");
  });

  it("should throw 400 AppError if the course has already been purchased", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    // findPurchaseItemByCourseId returns a purchase item → course has been bought
    (purchaseRepository.findPurchaseItemByCourseId as jest.Mock).mockResolvedValue({ id: "pi-1" });

    await expect(
      courseService.deleteCourse("course-1", "instructor-1", "INSTRUCTOR")
    ).rejects.toThrow(
      "Cannot delete course because it has already been purchased by students"
    );
    expect(courseRepository.deleteCourse).not.toHaveBeenCalled();
  });

  it("should delete the course on success", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    (purchaseRepository.findPurchaseItemByCourseId as jest.Mock).mockResolvedValue(null); // not purchased
    (courseRepository.deleteCourse as jest.Mock).mockResolvedValue(undefined);

    await courseService.deleteCourse("course-1", "instructor-1", "INSTRUCTOR");

    expect(courseRepository.deleteCourse).toHaveBeenCalledWith("course-1");
  });
});
