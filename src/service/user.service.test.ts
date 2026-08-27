import { userService } from "./user.service.js";
import { userRepository } from "../database/repository/user.repository.js";
import { AppError } from "../utils/appError.js";

// Mock repository
jest.mock("../database/repository/user.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("userService.getUserProfile", () => {
  it("should throw 404 AppError if user does not exist", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(userService.getUserProfile("non-existent-id")).rejects.toThrow(AppError);
    await expect(userService.getUserProfile("non-existent-id")).rejects.toThrow("User not found");
  });

  it("should return the user details without the password", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password_123",
      role: "STUDENT",
      bio: "Self-taught developer",
    });

    const result = await userService.getUserProfile("user-1");

    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    expect(result).not.toHaveProperty("password");
    expect(result.id).toBe("user-1");
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.bio).toBe("Self-taught developer");
  });
});

describe("userService.updateUserProfile", () => {
  it("should throw 404 AppError if user to update does not exist", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      userService.updateUserProfile("non-existent-id", { name: "New Name" })
    ).rejects.toThrow(AppError);
    await expect(
      userService.updateUserProfile("non-existent-id", { name: "New Name" })
    ).rejects.toThrow("User not found");

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("should call update with allowed fields and return the updated user without password", async () => {
    // Simulate user exists
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "Old Name",
      email: "john@example.com",
      password: "hashed_password",
      bio: "Old bio",
    });

    // Simulate update returns updated user
    (userRepository.update as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "New Name",
      email: "john@example.com",
      password: "hashed_password",
      bio: "New bio",
    });

    const result = await userService.updateUserProfile("user-1", {
      name: "New Name",
      bio: "New bio",
    });

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      name: "New Name",
      bio: "New bio",
    });

    expect(result).not.toHaveProperty("password");
    expect(result.name).toBe("New Name");
    expect(result.bio).toBe("New bio");
  });
});
