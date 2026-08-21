import { lessonRepository } from "../database/repository/lesson.repository.js";
import { courseRepository } from "../database/repository/course.repository.js";
import { AppError } from "../utils/appError.js";
import { LessonData } from "../type/types.js";

export const lessonService = {
    async addLesson(data: LessonData, userId?: string, userRole?: string) {
        // Validate course exists
        const course = await courseRepository.findCourseByIdWithDetails(data.courseId);
        if (!course) {
            throw new AppError("Course not found", 404);
        }

        if (userId && userRole !== "ADMIN" && course.instructor?.id !== userId) {
            throw new AppError("You are not authorized to add lessons to this course", 403);
        }

        return await lessonRepository.addLesson(data);
    },

    async updateLesson(id: string, data: Partial<LessonData>, userId?: string, userRole?: string) {
        const lesson = await lessonRepository.findById(id);
        if (!lesson) {
            throw new AppError("Lesson not found", 404);
        }

        if (userId && userRole !== "ADMIN") {
            const course = await courseRepository.findCourseByIdWithDetails(lesson.course.id);
            if (course?.instructor?.id !== userId) {
                throw new AppError("You are not authorized to edit lessons in this course", 403);
            }
        }

        return await lessonRepository.updateLesson(id, data);
    },

    async deleteLesson(id: string, userId?: string, userRole?: string) {
        const lesson = await lessonRepository.findById(id);
        if (!lesson) {
            throw new AppError("Lesson not found", 404);
        }

        if (userId && userRole !== "ADMIN") {
            const course = await courseRepository.findCourseByIdWithDetails(lesson.course.id);
            if (course?.instructor?.id !== userId) {
                throw new AppError("You are not authorized to delete lessons from this course", 403);
            }
        }

        return await lessonRepository.deleteLesson(id);
    },
};
