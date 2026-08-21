import { AppDataSource } from "../db-connection.js";
import { Enrollment } from "../entities/Enrollment.entity.js";



export const enrollmentRepository = {
    getRepository() {
        return AppDataSource.getRepository(Enrollment);
    },

    async getEnrollmentsByUserId(userId: string) {
        const repo = this.getRepository();
        const enrollments = await repo.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                course: true,
            },
        });

        return enrollments;
    },

    async findEnrollment(userId: string, courseId: string) {
        const repo = this.getRepository();
        return await repo.findOne({
            where: {
                user: { id: userId },
                course: { id: courseId },
            },
        });
    },
};

