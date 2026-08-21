import { courseRepository } from "../database/repository/course.repository.js";
import { topicRepository } from "../database/repository/topic.repository.js";
import { enrollmentRepository } from "../database/repository/enrollment.repository.js";
import { lessonProgressRepository } from "../database/repository/progress.repository.js";
import { AppDataSource } from "../database/db-connection.js";
import { User, PurchaseItem } from "../database/entities/index.js";
import { AppError } from "../utils/appError.js";
import { CreateCourse } from "../type/types.js";

export const courseService = {
    async createCourse(data: CreateCourse) {
        // Validate topic exists
        const topic = await topicRepository.getTopicById(data.topicId);
        if (!topic) {
            throw new AppError("Topic not found", 404);
        }

        // Validate instructor exists and has the correct role
        const instructor = await AppDataSource.getRepository(User).findOne({
            where: { id: data.instructorId },
        });
        if (!instructor) {
            throw new AppError("Instructor not found", 404);
        }
        if (instructor.role !== "INSTRUCTOR" && instructor.role !== "ADMIN") {
            throw new AppError("User is not an instructor", 403);
        }
        return await courseRepository.create(data);
    },

    async getAllCourses() {
        return await courseRepository.findAll();
    },

    async getCourseById(id: string, userId: string, userRole?: string) {
        const course = await courseRepository.findCourseByIdWithDetails(id);
        if (!course) {
            throw new AppError("Course not found", 404);
        }

        const enrollment = await enrollmentRepository.findEnrollment(userId, id);

        // Only the enrolled student, course instructor, or ADMIN can view course details
        if (userRole !== "ADMIN" && course.instructor?.id !== userId) {
            if (!enrollment) {
                throw new AppError("Access denied. You must purchase this course to view its details", 403);
            }
        }

        let completedLessonIds = new Set<string>();
        if (enrollment) {
            const completedProgress = await lessonProgressRepository.getCompletedLessons(enrollment.id, id);
            completedLessonIds = new Set(completedProgress.map((p) => p.lesson.id));
        }

        const lessonsWithStatus = (course.lessons || []).map((lesson) => ({
            ...lesson,
            isCompleted: completedLessonIds.has(lesson.id),
        }));

        return {
            ...course,
            lessons: lessonsWithStatus,
        };
    },

    async updateCourse(id: string, data: Partial<CreateCourse>, userId: string, userRole?: string) {
        const course = await courseRepository.findCourseByIdWithDetails(id);
        if (!course) {
            throw new AppError("Course not found", 404);
        }
        if (userRole !== "ADMIN" && course.instructor?.id !== userId) {
            throw new AppError("You are not authorized to edit this course", 403);
        }

        if (data.topicId) {
            const topic = await topicRepository.getTopicById(data.topicId);
            if (!topic) {
                throw new AppError("Topic not found", 404);
            }
        }

        if (data.instructorId) {
            const instructor = await AppDataSource.getRepository(User).findOne({
                where: { id: data.instructorId },
            });
            if (!instructor) {
                throw new AppError("Instructor not found", 404);
            }
            if (instructor.role !== "INSTRUCTOR" && instructor.role !== "ADMIN") {
                throw new AppError("User is not an instructor", 403);
            }
        }

        return await courseRepository.updateCourse(id, data);
    },

    async deleteCourse(id: string, userId: string, userRole?: string) {
        const course = await courseRepository.findCourseByIdWithDetails(id);
        if (!course) {
            throw new AppError("Course not found", 404);
        }

        if (userRole !== "ADMIN" && course.instructor?.id !== userId) {
            throw new AppError("You are not authorized to delete this course", 403);
        }

        const purchaseItem = await AppDataSource.getRepository(PurchaseItem).findOne({
            where: { course: { id } },
        });
        if (purchaseItem) {
            throw new AppError("Cannot delete course because it has already been purchased by students", 400);
        }

        return await courseRepository.deleteCourse(id);
    },
};
