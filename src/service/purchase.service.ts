import { purchaseRepository } from "../database/repository/purchase.repository.js";
import { courseRepository } from "../database/repository/course.repository.js";
import { enrollmentRepository } from "../database/repository/enrollment.repository.js";
import { AppError } from "../utils/appError.js";
import { CreatePurchaseRepoInput } from "../type/types.js";

export const purchaseService = {
    async createPurchase(userId: string, items: { courseId: string }[]) {
        if (!items || items.length === 0) {
            throw new AppError("At least one course is required to make a purchase", 400);
        }

        const courseIds = items.map((i) => i.courseId);
        const uniqueCourseIds = new Set(courseIds);
        if (uniqueCourseIds.size !== courseIds.length) {
            throw new AppError("Duplicate courses found in purchase request", 400);
        }

        const itemsWithPrice: { courseId: string; price: number }[] = [];

        // Validate each course exists, user is not already enrolled, and get price
        for (const item of items) {
            const course = await courseRepository.findCourseByIdWithDetails(item.courseId);
            if (!course) {
                throw new AppError(`Course with id "${item.courseId}" not found`, 404);
            }

            const existingEnrollment = await enrollmentRepository.findEnrollment(userId, item.courseId);
            if (existingEnrollment) {
                throw new AppError(`You are already enrolled in "${course.title}"`, 409);
            }

            itemsWithPrice.push({
                courseId: course.id,
                price: Number(course.price),
            });
        }

        const totalAmount = itemsWithPrice.reduce((sum, item) => sum + item.price, 0);

        const purchaseInput: CreatePurchaseRepoInput = {
            userId,
            totalAmount,
            items: itemsWithPrice,
        };

        return await purchaseRepository.createPurchase(purchaseInput);
    },

    async getMyPurchases(userId: string) {
        return await purchaseRepository.findPurchasesByUserId(userId);
    },
};
