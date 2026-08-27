import jwt from "jsonwebtoken";
import { userRepository } from "../database/repository/user.repository.js";
import { config } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { emailService } from "../utils/email.js";

interface ApprovalPayload {
  name: string;
  email: string;
  passwordHash: string;
  role: "INSTRUCTOR";
  type: string;
}

export const adminService = {
  async approveInstructor(token: string) {
    if (!token) {
      throw new AppError("Approval token is required", 400);
    }

    let payload: ApprovalPayload;
    try {
      payload = jwt.verify(token, config.jwtSecret) as ApprovalPayload;
    } catch (err) {
      throw new AppError("Invalid or expired approval token", 400);
    }

    if (payload.type !== "INSTRUCTOR_APPROVAL") {
      throw new AppError("Invalid token type for instructor approval", 400);
    }

    // Use transaction to create user and enforce uniqueness
    const user = await userRepository.createInstructorWithTransaction({
      name: payload.name,
      email: payload.email,
      password: payload.passwordHash,
    });

    // Send optional welcome email to instructor
    await emailService.sendInstructorWelcomeEmail({
      instructorName: user.name,
      instructorEmail: user.email,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
