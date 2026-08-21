import { enrollmentRepository } from "../database/repository/enrollment.repository.js";
import { AppError } from "../utils/appError.js";

export const enrollmentService = {
    async getMyEnrollments(userId: string) {
        const enrollments = await enrollmentRepository.getEnrollmentsByUserId(userId);
        return enrollments;
    },
};
