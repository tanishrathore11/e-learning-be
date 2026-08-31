import { CreateUser } from "../../type/types.js";
import { AppDataSource } from "../db-connection.js"
import { User } from "../model/index.js"
import { AppError } from "../../util/appError.js";


export const userRepository = {
    getRepository() {
        return AppDataSource.getRepository(User);
    },

    async createUser(userData: CreateUser) {
        const repo = this.getRepository();
        const user = repo.create(userData);
        return await repo.save(user);
    },

    async findByEmail(email: string) {
        const repo = this.getRepository();
        return await repo.findOne({ where: { email } });
    },

    async findById(id: string) {
        const repo = this.getRepository();
        return await repo.findOne({ where: { id } });
    },

    async update(id: string, updateData: Partial<User>) {
        const repo = this.getRepository();
        await repo.update(id, updateData);
        return await this.findById(id);
    },

    async createInstructorWithTransaction(userData: CreateUser) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const userRepo = transactionalEntityManager.getRepository(User);
            const existing = await userRepo.findOne({ where: { email: userData.email } });
            if (existing) {
                throw new AppError("Email is already registered", 409);
            }

            const user = userRepo.create({
                ...userData,
                role: "INSTRUCTOR",
                approvalStatus: "PENDING",
            });
            return await userRepo.save(user);
        });
    },

    async findPendingInstructors() {
        const repo = this.getRepository();
        return await repo.find({
            where: {
                role: "INSTRUCTOR",
                approvalStatus: "PENDING",
            },
            order: { createdAt: "DESC" },
        });
    },

    async updateApprovalStatus(id: string, approvalStatus: "APPROVED" | "REJECTED") {
        const repo = this.getRepository();
        await repo.update(id, { approvalStatus });
        return await this.findById(id);
    }
}