import jwt from "jsonwebtoken";
import { userRepository } from "../database/repository/user.repository.js";
import { config } from "../config/secrets.js";
import { AppError } from "../util/appError.js";
import { emailService } from "../util/mailer.js";

interface ApprovalPayload {
  name: string;
  email: string;
  passwordHash: string;
  role: "INSTRUCTOR";
  type: string;
}

export const adminService = {
  async getPendingInstructors() {
    const pending = await userRepository.findPendingInstructors();
    return pending.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  },

  async approveInstructorById(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Instructor user not found", 404);
    }
    if (user.role !== "INSTRUCTOR") {
      throw new AppError("User is not an instructor", 400);
    }

    const updatedUser = await userRepository.updateApprovalStatus(userId, "APPROVED");

    if (updatedUser) {
      await emailService.sendInstructorWelcomeEmail({
        instructorName: updatedUser.name,
        instructorEmail: updatedUser.email,
      });
    }

    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword;
  },

  async rejectInstructorById(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Instructor user not found", 404);
    }
    if (user.role !== "INSTRUCTOR") {
      throw new AppError("User is not an instructor", 400);
    }

    const updatedUser = await userRepository.updateApprovalStatus(userId, "REJECTED");

    if (updatedUser) {
      await emailService.sendInstructorRejectionEmail({
        instructorName: updatedUser.name,
        instructorEmail: updatedUser.email,
      });
    }

    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword;
  },

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

    let user = await userRepository.findByEmail(payload.email);
    if (!user) {
      user = await userRepository.createInstructorWithTransaction({
        name: payload.name,
        email: payload.email,
        password: payload.passwordHash,
      });
    }

    const updatedUser = await userRepository.updateApprovalStatus(user.id, "APPROVED");

    await emailService.sendInstructorWelcomeEmail({
      instructorName: updatedUser!.name,
      instructorEmail: updatedUser!.email,
    });

    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword;
  },
};
