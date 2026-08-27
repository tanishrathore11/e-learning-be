import { courseRepository } from "../database/repository/course.repository.js";
import { enrollmentRepository } from "../database/repository/enrollment.repository.js";
import { lessonProgressRepository } from "../database/repository/progress.repository.js";
import { userRepository } from "../database/repository/user.repository.js";
import { AppError } from "../utils/appError.js";

export const dashboardService = {
    async getAdminDashboard() {
        const students = await userRepository.getRepository().find({
            where: { role: "STUDENT" },
            relations: { enrollments: true },
        });

        const instructors = await userRepository.getRepository().find({
            where: { role: "INSTRUCTOR" },
            relations: { courses: { enrollments: { user: true } } },
        });

        const studentList = students.map((student) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            bio: student.bio,
            courseCount: student.enrollments ? student.enrollments.length : 0,
        }));

        const instructorList = instructors.map((instructor) => {
            const courses = instructor.courses || [];
            const studentIds = new Set<string>();
            for (const course of courses) {
                if (course.enrollments) {
                    for (const enrollment of course.enrollments) {
                        if (enrollment.user) {
                            studentIds.add(enrollment.user.id);
                        }
                    }
                }
            }
            return {
                id: instructor.id,
                name: instructor.name,
                email: instructor.email,
                bio: instructor.bio,
                courseCount: courses.length,
                studentCount: studentIds.size,
            };
        });

        return {
            students: studentList,
            instructors: instructorList,
        };
    },
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
    async removeLessonCompleted(enrollmentId: string, lessonId: string) {
        return await lessonProgressRepository.removeLessonCompleted(enrollmentId, lessonId);
    },
};
