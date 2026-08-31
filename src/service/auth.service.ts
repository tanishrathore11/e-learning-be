import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../database/repository/user.repository.js";
import { config } from "../config/secrets.js";
import { CreateUser } from "../type/types.js";
import { AppError } from "../util/appError.js";
import { emailService } from "../util/mailer.js";

export const authService = {
    async register(data: CreateUser) {
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw new AppError("Email is already registered", 409);
        }

        const hashedPassword = await bcrypt.hash(data.password!, 10);

        const user = await userRepository.createUser({
            ...data,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret);

        const { password, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError("Invalid email or password", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Invalid email or password", 401);
        }

        if (user.approvalStatus === "PENDING") {
            throw new AppError("Your account is pending admin approval.", 403);
        }

        if (user.approvalStatus === "REJECTED") {
            throw new AppError("Your instructor registration request was rejected by an administrator.", 403);
        }

        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret);

        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },

    async registerInstructorApproval(data: CreateUser) {
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            if (existing.approvalStatus === "REJECTED") {
                throw new AppError("Your instructor registration request was rejected.", 403);
            }
            if (existing.approvalStatus === "PENDING") {
                throw new AppError("Your instructor registration request is already pending approval.", 400);
            }
            throw new AppError("Email is already registered", 409);
        }

        const hashedPassword = await bcrypt.hash(data.password!, 10);

        const user = await userRepository.createUser({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: "INSTRUCTOR",
            approvalStatus: "PENDING",
            bio: data.bio,
        });

        // Send notification email to ADMIN
        await emailService.sendAdminApprovalEmail({
            instructorName: user.name,
            instructorEmail: user.email,
        });

        const { password: _, ...userWithoutPassword } = user;
        return {
            success: true,
            message: "Instructor registration submitted for admin approval.",
            user: userWithoutPassword,
        };
    },
};
