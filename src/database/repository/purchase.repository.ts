import { CreatePurchaseRepoInput } from "../../type/types.js";
import { AppDataSource } from "../db-connection.js";
import { PurchaseItem, Purchases, Enrollment } from "../entities/index.js";


export const purchaseRepository = {
    getRepository() {
        return AppDataSource.getRepository(Purchases);
    },

    async createPurchase(data: CreatePurchaseRepoInput) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const purchaseRepo = transactionalEntityManager.getRepository(Purchases);
            const purchaseItemRepo = transactionalEntityManager.getRepository(PurchaseItem);
            const enrollmentRepo = transactionalEntityManager.getRepository(Enrollment);

            const newPurchase = purchaseRepo.create({
                user: {
                    id: data.userId,
                },
                totalAmount: data.totalAmount,
            });
            const savedPurchase = await purchaseRepo.save(newPurchase);

            const purchaseItems = data.items.map((item) =>
                purchaseItemRepo.create({
                    purchase: {
                        id: savedPurchase.id,
                    },
                    course: {
                        id: item.courseId,
                    },
                    amount: item.price,
                })
            );
            await purchaseItemRepo.save(purchaseItems);

            const enrollments = data.items.map((item) =>
                enrollmentRepo.create({
                    user: {
                        id: data.userId,
                    },
                    course: {
                        id: item.courseId,
                    },
                })
            );
            await enrollmentRepo.save(enrollments);

            return savedPurchase;
        });
    },
    async findPurchasesByUserId(userId: string) {
        const repo = this.getRepository();
        const purchases = await repo.find({
            where: { user: { id: userId } },
            relations: {
                items: {
                    course: true,
                },
            },
        });
        return purchases;
    },
};   