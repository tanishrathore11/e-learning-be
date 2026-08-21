import { CreateCourse } from "../../type/types.js";
import { AppDataSource } from "../db-connection.js"
import { Course } from "../entities/index.js"


export const courseRepository = {
    getRepository() {
        return AppDataSource.getRepository(Course);
    },

    async create(createCourseData: CreateCourse) {
        const repo = this.getRepository();
        const course = repo.create({
            title: createCourseData.title,
            description: createCourseData.description,
            topic: { id: createCourseData.topicId },
            instructor: { id: createCourseData.instructorId },
            price: createCourseData.price,
        });
        return await repo.save(course);
    },
    async findAll() {
        const repo = this.getRepository();
        return await repo.find();
    },
    async findCourseByIdWithDetails(id: string) {
        const repo = this.getRepository();
        return await repo.findOne({
            where: { id },
            relations: {
                topic: true,
                instructor: true,
                lessons: true
            }
        });
    },
    async updateCourse(id: string, data: Partial<CreateCourse>) {
        const repo = this.getRepository();
        const updateData: Record<string, any> = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.topicId !== undefined) updateData.topic = { id: data.topicId };
        if (data.instructorId !== undefined) updateData.instructor = { id: data.instructorId };

        await repo.update(id, updateData);
        return await this.findCourseByIdWithDetails(id);
    },
    async deleteCourse(id: string) {
        const repo = this.getRepository();
        return await repo.delete(id);
    },

    async getInstructorDashboard(instructorId: string) {
        const repo = this.getRepository();

        return await repo
            .createQueryBuilder("course")
            .leftJoin("course.instructor", "instructor")
            .leftJoin("course.enrollments", "enrollment")
            .leftJoin("enrollment.user", "student")

            .select([
                "course.id AS course_id",
                "course.title AS course_name",

                "student.id AS student_id",
                "student.name AS student_name",

                // Total lessons in this course
                `(SELECT COUNT(*)
              FROM lessons lesson
              WHERE lesson.course_id = course.id
            ) AS total_lessons`,

                // Lessons completed by this student
                `(SELECT COUNT(*)
              FROM progress progress
              INNER JOIN lessons completed_lesson
                  ON completed_lesson.id = progress.lesson_id
              WHERE progress.enrollment_id = enrollment.id
                AND completed_lesson.course_id = course.id
            ) AS completed_lessons`,
            ])

            .where("instructor.id = :instructorId", {
                instructorId,
            })

            .groupBy("course.id")
            .addGroupBy("course.title")
            .addGroupBy("student.id")
            .addGroupBy("student.name")
            .addGroupBy("enrollment.id")

            .orderBy("course.title", "ASC")
            .getRawMany();
    }
}