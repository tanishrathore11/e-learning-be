import { lessonService } from "../../../src/service/lesson.service.js";
import { lessonRepository } from "../../../src/database/repository/lesson.repository.js";
import { courseRepository } from "../../../src/database/repository/course.repository.js";
import { AppError } from "../../../src/util/appError.js";

jest.mock("../../../src/database/repository/lesson.repository.js");
jest.mock("../../../src/database/repository/course.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// addLesson
// -------------------------------------------------------------------
describe("lessonService.addLesson", () => {
  it("should throw 404 AppError if the course does not exist", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue(null);

    await expect(
      lessonService.addLesson({ courseId: "bad-course", title: "Lesson 1", videoUrl: "url", type: "VIDEO" })
    ).rejects.toThrow("Course not found");
  });

  it("should throw 403 AppError if the user is not the course instructor", async () => {
    // Course belongs to a different instructor
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "other-instructor" },
    });

    await expect(
      lessonService.addLesson(
        { courseId: "course-1", title: "Lesson 1", videoUrl: "url", type: "VIDEO" },
        "user-1",    // userId
        "INSTRUCTOR" // userRole — not ADMIN and not the owner
      )
    ).rejects.toThrow("You are not authorized to add lessons to this course");
  });

  it("should add a lesson if the user is the course instructor", async () => {
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" }, // matches userId below
    });

    const mockLesson = { id: "lesson-1", title: "Lesson 1" };
    (lessonRepository.addLesson as jest.Mock).mockResolvedValue(mockLesson);

    const result = await lessonService.addLesson(
      { courseId: "course-1", title: "Lesson 1", videoUrl: "url", type: "VIDEO" },
      "instructor-1",
      "INSTRUCTOR"
    );

    expect(lessonRepository.addLesson).toHaveBeenCalled();
    expect(result).toEqual(mockLesson);
  });
});

// -------------------------------------------------------------------
// updateLesson
// -------------------------------------------------------------------
describe("lessonService.updateLesson", () => {
  it("should throw 404 AppError if the lesson does not exist", async () => {
    (lessonRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      lessonService.updateLesson("bad-lesson-id", { title: "New Title" })
    ).rejects.toThrow("Lesson not found");
  });

  it("should throw 403 AppError if user is not authorized to edit lesson", async () => {
    (lessonRepository.findById as jest.Mock).mockResolvedValue({
      id: "lesson-1",
      course: { id: "course-1" },
    });
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "other-instructor" },
    });

    await expect(
      lessonService.updateLesson("lesson-1", { title: "New Title" }, "user-1", "INSTRUCTOR")
    ).rejects.toThrow("You are not authorized to edit lessons in this course");
  });

  it("should successfully update lesson if user is instructor", async () => {
    (lessonRepository.findById as jest.Mock).mockResolvedValue({
      id: "lesson-1",
      course: { id: "course-1" },
    });
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    const mockUpdatedLesson = { id: "lesson-1", title: "New Title" };
    (lessonRepository.updateLesson as jest.Mock).mockResolvedValue(mockUpdatedLesson);

    const result = await lessonService.updateLesson("lesson-1", { title: "New Title" }, "instructor-1", "INSTRUCTOR");
    expect(result).toEqual(mockUpdatedLesson);
  });
});

// -------------------------------------------------------------------
// deleteLesson
// -------------------------------------------------------------------
describe("lessonService.deleteLesson", () => {
  it("should throw 404 AppError if the lesson does not exist", async () => {
    (lessonRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(lessonService.deleteLesson("bad-lesson-id")).rejects.toThrow(
      "Lesson not found"
    );
  });

  it("should throw 403 AppError if the user does not own the course", async () => {
    (lessonRepository.findById as jest.Mock).mockResolvedValue({
      id: "lesson-1",
      course: { id: "course-1" },
    });
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "other-instructor" }, // different from userId
    });

    await expect(
      lessonService.deleteLesson("lesson-1", "user-1", "INSTRUCTOR")
    ).rejects.toThrow("You are not authorized to delete lessons from this course");
  });

  it("should delete the lesson if the user is the course instructor", async () => {
    (lessonRepository.findById as jest.Mock).mockResolvedValue({
      id: "lesson-1",
      course: { id: "course-1" },
    });
    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      instructor: { id: "instructor-1" },
    });
    (lessonRepository.deleteLesson as jest.Mock).mockResolvedValue(undefined);

    await lessonService.deleteLesson("lesson-1", "instructor-1", "INSTRUCTOR");

    expect(lessonRepository.deleteLesson).toHaveBeenCalledWith("lesson-1");
  });
});
