import { Request, Response, NextFunction } from "express";
import { courseController } from "./course.controller.js";
import { courseService } from "../../service/course.service.js";

// Mock the entire course service so we don't hit the database
jest.mock("../../service/course.service.js");

// -------------------------------------------------------------------
// Shared test helpers (same pattern as auth.controller.test.ts)
// -------------------------------------------------------------------
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as unknown as NextFunction;

beforeEach(() => {
  // Reset all mocks before every test so they don't bleed into each other
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// createCourse
// -------------------------------------------------------------------
describe("courseController.createCourse", () => {
  it("should create a course and return 201", async () => {
    const mockRequest = {
      body: { title: "My Course", description: "Learn stuff" },
      user: { id: "instructor-1", role: "instructor" },
    } as unknown as Request;

    const mockCourse = { id: "course-1", title: "My Course" };
    (courseService.createCourse as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.createCourse(mockRequest, mockResponse, mockNext);

    // Service should be called with body + instructorId from JWT
    expect(courseService.createCourse).toHaveBeenCalledWith({
      title: "My Course",
      description: "Learn stuff",
      instructorId: "instructor-1",
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });

    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {
      body: { title: "My Course" },
      user: { id: "instructor-1", role: "instructor" },
    } as unknown as Request;

    const error = new Error("Database error");
    (courseService.createCourse as jest.Mock).mockRejectedValue(error);

    await courseController.createCourse(mockRequest, mockResponse, mockNext);

    // The controller should forward the error to Express error handler
    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// getAllCourses
// -------------------------------------------------------------------
describe("courseController.getAllCourses", () => {
  it("should return all courses with status 200", async () => {
    const mockRequest = {} as Request;

    const mockCourses = [
      { id: "course-1", title: "Course A" },
      { id: "course-2", title: "Course B" },
    ];
    (courseService.getAllCourses as jest.Mock).mockResolvedValue(mockCourses);

    await courseController.getAllCourses(mockRequest, mockResponse, mockNext);

    expect(courseService.getAllCourses).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourses,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {} as Request;

    const error = new Error("Something went wrong");
    (courseService.getAllCourses as jest.Mock).mockRejectedValue(error);

    await courseController.getAllCourses(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

// -------------------------------------------------------------------
// getCourseById
// -------------------------------------------------------------------
describe("courseController.getCourseById", () => {
  it("should return a single course with status 200", async () => {
    const mockRequest = {
      params: { id: "course-1" },
      user: { id: "user-1", role: "student" },
    } as unknown as Request;

    const mockCourse = { id: "course-1", title: "Course A" };
    (courseService.getCourseById as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.getCourseById(mockRequest, mockResponse, mockNext);

    expect(courseService.getCourseById).toHaveBeenCalledWith(
      "course-1",
      "user-1",
      "student"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {
      params: { id: "course-1" },
      user: { id: "user-1", role: "student" },
    } as unknown as Request;

    const error = new Error("Not found");
    (courseService.getCourseById as jest.Mock).mockRejectedValue(error);

    await courseController.getCourseById(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

// -------------------------------------------------------------------
// updateCourse
// -------------------------------------------------------------------
describe("courseController.updateCourse", () => {
  it("should update a course and return 200", async () => {
    const mockRequest = {
      params: { id: "course-1" },
      body: { title: "Updated Title" },
      user: { id: "instructor-1", role: "instructor" },
    } as unknown as Request;

    const mockCourse = { id: "course-1", title: "Updated Title" };
    (courseService.updateCourse as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.updateCourse(mockRequest, mockResponse, mockNext);

    expect(courseService.updateCourse).toHaveBeenCalledWith(
      "course-1",
      { title: "Updated Title" },
      "instructor-1",
      "instructor"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {
      params: { id: "course-1" },
      body: { title: "Updated Title" },
      user: { id: "instructor-1", role: "instructor" },
    } as unknown as Request;

    const error = new Error("Not authorized");
    (courseService.updateCourse as jest.Mock).mockRejectedValue(error);

    await courseController.updateCourse(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

// -------------------------------------------------------------------
// deleteCourse
// -------------------------------------------------------------------
describe("courseController.deleteCourse", () => {
  it("should delete a course and return a success message", async () => {
    const mockRequest = {
      params: { id: "course-1" },
      user: { id: "instructor-1", role: "instructor" },
    } as unknown as Request;

    (courseService.deleteCourse as jest.Mock).mockResolvedValue(undefined);

    await courseController.deleteCourse(mockRequest, mockResponse, mockNext);

    expect(courseService.deleteCourse).toHaveBeenCalledWith(
      "course-1",
      "instructor-1",
      "instructor"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Course deleted successfully",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {
      params: { id: "course-1" },
      user: { id: "instructor-1", role: "instructor" },
    } as unknown as Request;

    const error = new Error("Delete failed");
    (courseService.deleteCourse as jest.Mock).mockRejectedValue(error);

    await courseController.deleteCourse(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
