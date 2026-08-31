import { dashboardService } from "../../../src/service/dashboard.service.js";
import { courseRepository } from "../../../src/database/repository/course.repository.js";
import { enrollmentRepository } from "../../../src/database/repository/enrollment.repository.js";
import { lessonProgressRepository } from "../../../src/database/repository/progress.repository.js";
import { userRepository } from "../../../src/database/repository/user.repository.js";

jest.mock("../../../src/database/repository/course.repository.js");
jest.mock("../../../src/database/repository/enrollment.repository.js");
jest.mock("../../../src/database/repository/progress.repository.js");
jest.mock("../../../src/database/repository/user.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// getInstructorDashboard
// The service transforms raw DB rows into a grouped summary object.
// This is the logic worth testing.
// -------------------------------------------------------------------
describe("dashboardService.getInstructorDashboard", () => {
  it("should group students by course and calculate totalCourses and totalStudents", async () => {
    // Simulate the raw rows that the repository returns (like a SQL JOIN result)
    const mockRows = [
      {
        course_id: "course-1",
        course_name: "JS Basics",
        student_id: "student-1",
        student_name: "Alice",
        total_lessons: "4",
        completed_lessons: "2", // 2/4 = 50%
      },
      {
        course_id: "course-1",
        course_name: "JS Basics",
        student_id: "student-2",
        student_name: "Bob",
        total_lessons: "4",
        completed_lessons: "4", // 4/4 = 100%
      },
    ];
    (courseRepository.getInstructorDashboard as jest.Mock).mockResolvedValue(mockRows);

    const result = await dashboardService.getInstructorDashboard("instructor-1");

    expect(result.totalCourses).toBe(1);      // 1 unique course
    expect(result.totalStudents).toBe(2);     // 2 unique students
    expect(result.courses).toHaveLength(1);

    const course = result.courses[0];
    expect(course.courseName).toBe("JS Basics");
    expect(course.students).toHaveLength(2);

    // Alice: 2/4 = 50%
    expect(course.students[0]).toEqual({ name: "Alice", completionPercentage: 50 });
    // Bob: 4/4 = 100%
    expect(course.students[1]).toEqual({ name: "Bob", completionPercentage: 100 });
  });

  it("should return 0% completion when a course has no lessons", async () => {
    const mockRows = [
      {
        course_id: "course-1",
        course_name: "Empty Course",
        student_id: "student-1",
        student_name: "Alice",
        total_lessons: "0",   // no lessons
        completed_lessons: "0",
      },
    ];
    (courseRepository.getInstructorDashboard as jest.Mock).mockResolvedValue(mockRows);

    const result = await dashboardService.getInstructorDashboard("instructor-1");

    // Should not divide by zero — should return 0%
    expect(result.courses[0].students[0].completionPercentage).toBe(0);
  });
});

// -------------------------------------------------------------------
// getStudentDashboard
// -------------------------------------------------------------------
describe("dashboardService.getStudentDashboard", () => {
  it("should return enrollments with completed lesson count", async () => {
    const mockEnrollments = [
      { id: "enrollment-1", course: { id: "course-1" } },
    ];
    (enrollmentRepository.getEnrollmentsByUserId as jest.Mock).mockResolvedValue(mockEnrollments);

    // 3 completed lessons for this enrollment
    (lessonProgressRepository.getCompletedLessons as jest.Mock).mockResolvedValue([
      { id: "progress-1" },
      { id: "progress-2" },
      { id: "progress-3" },
    ]);

    const result = await dashboardService.getStudentDashboard("student-1");

    expect(result).toHaveLength(1);
    expect(result[0].enrollment).toEqual(mockEnrollments[0]);
    expect(result[0].completedLessons).toBe(3); // count of completed lessons
  });
});

// -------------------------------------------------------------------
// markLessonCompleted
// -------------------------------------------------------------------
describe("dashboardService.markLessonCompleted", () => {
  it("should mark a lesson as completed", async () => {
    const mockProgress = { id: "progress-1" };
    (lessonProgressRepository.markLessonCompleted as jest.Mock).mockResolvedValue(mockProgress);

    const result = await dashboardService.markLessonCompleted("enrollment-1", "lesson-1");
    expect(result).toEqual(mockProgress);
    expect(lessonProgressRepository.markLessonCompleted).toHaveBeenCalledWith("enrollment-1", "lesson-1");
  });
});

// -------------------------------------------------------------------
// getAdminDashboard
// -------------------------------------------------------------------
describe("dashboardService.getAdminDashboard", () => {
  it("should return student and instructor listings with correct course/student counts", async () => {
    const mockStudents = [
      { id: "stud-1", name: "S1", email: "s1@example.com", bio: "Bio 1", enrollments: [{}, {}] },
      { id: "stud-2", name: "S2", email: "s2@example.com", bio: null, enrollments: [] }
    ];

    const mockInstructors = [
      {
        id: "inst-1",
        name: "I1",
        email: "i1@example.com",
        bio: "Instructor 1",
        courses: [
          { enrollments: [{ user: { id: "stud-1" } }, { user: { id: "stud-2" } }] },
          { enrollments: [{ user: { id: "stud-1" } }] }
        ]
      }
    ];

    const mockFind = jest.fn().mockImplementation((options) => {
      if (options.where.role === "STUDENT") return Promise.resolve(mockStudents);
      if (options.where.role === "INSTRUCTOR") return Promise.resolve(mockInstructors);
      return Promise.resolve([]);
    });

    (userRepository.getRepository as jest.Mock).mockReturnValue({
      find: mockFind
    });

    const result = await dashboardService.getAdminDashboard();

    expect(result.students).toHaveLength(2);
    expect(result.students[0]).toEqual({
      id: "stud-1",
      name: "S1",
      email: "s1@example.com",
      bio: "Bio 1",
      courseCount: 2
    });
    expect(result.students[1]).toEqual({
      id: "stud-2",
      name: "S2",
      email: "s2@example.com",
      bio: null,
      courseCount: 0
    });

    expect(result.instructors).toHaveLength(1);
    expect(result.instructors[0]).toEqual({
      id: "inst-1",
      name: "I1",
      email: "i1@example.com",
      bio: "Instructor 1",
      courseCount: 2,
      studentCount: 2
    });
  });
});
