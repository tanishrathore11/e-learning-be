import { userRepository } from "../database/repository/user.repository.js";
import { AppError } from "../utils/appError.js";

export const userService = {
    async getUserProfile(id: string) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    async updateUserProfile(id: string, data: { name?: string; bio?: string | null }) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const updateData: Record<string, any> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.bio !== undefined) updateData.bio = data.bio;

        const updatedUser = await userRepository.update(id, updateData);
        if (!updatedUser) {
            throw new AppError("User not found", 404);
        }

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
};
