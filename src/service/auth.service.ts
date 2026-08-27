import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../database/repository/user.repository.js";
import { config } from "../config/env.js";
import { CreateUser } from "../type/types.js";
import { AppError } from "../utils/appError.js";
import { emailService } from "../utils/email.js";

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

        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret);

        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },

    async registerInstructorApproval(data: CreateUser) {
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw new AppError("Email is already registered", 409);
        }

        const hashedPassword = await bcrypt.hash(data.password!, 10);

        // Sign JWT containing name, email, passwordHash, role, type
        const approvalToken = jwt.sign(
            {
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                role: "INSTRUCTOR",
                type: "INSTRUCTOR_APPROVAL",
            },
            config.jwtSecret
        );

        // Send email to ADMIN
        await emailService.sendAdminApprovalEmail({
            instructorName: data.name,
            instructorEmail: data.email,
            approvalToken,
        });

        return {
            success: true,
            message: "Instructor registration submitted for admin approval.",
        };
    },
};
