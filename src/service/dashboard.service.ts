import { courseRepository } from "../database/repository/course.repository.js";
import { enrollmentRepository } from "../database/repository/enrollment.repository.js";
import { lessonProgressRepository } from "../database/repository/progress.repository.js";
import { AppError } from "../utils/appError.js";

export const dashboardService = {
    async getInstructorDashboard(instructorId: string) {
        const rows = await courseRepository.getInstructorDashboard(instructorId);

        const coursesMap = new Map<string, any>();

        const students = new Set<string>();

        for (const row of rows) {
            if (!coursesMap.has(row.course_id)) {
                coursesMap.set(row.course_id, {
                    courseName: row.course_name,
                    students: [],
                });
            }

            if (row.student_id) {
                students.add(row.student_id);

                const completionPercentage =
                    Number(row.total_lessons) === 0
                        ? 0
                        : Math.round(
                            (Number(row.completed_lessons) /
                                Number(row.total_lessons)) *
                            100
                        );

                coursesMap.get(row.course_id).students.push({
                    name: row.student_name,
                    completionPercentage,
                });
            }
        }

        return {
            totalCourses: coursesMap.size,
            totalStudents: students.size,
            courses: Array.from(coursesMap.values()),
        };
    },
    async getStudentDashboard(userId: string) {
        const enrollments = await enrollmentRepository.getEnrollmentsByUserId(userId);

        const result = await Promise.all(
            enrollments.map(async (enrollment) => {
                const completedLessons = await lessonProgressRepository.getCompletedLessons(
                    enrollment.id,
                    enrollment.course.id
                );

                return {
                    enrollment,
                    completedLessons: completedLessons.length,
                };
            })
        );

        return result;
    },
    async markLessonCompleted(enrollmentId: string, lessonId: string) {
        return await lessonProgressRepository.markLessonCompleted(enrollmentId, lessonId);
    },
};
