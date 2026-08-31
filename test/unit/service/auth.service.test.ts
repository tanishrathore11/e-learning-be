import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authService } from "../../../src/service/auth.service.js";
import { userRepository } from "../../../src/database/repository/user.repository.js";
import { AppError } from "../../../src/util/appError.js";
import { emailService } from "../../../src/util/mailer.js";

// Mock external libraries and the repository
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../src/database/repository/user.repository.js");
jest.mock("../../../src/util/mailer.js");

// Give jwt.sign a fake secret to work with
jest.mock("../../../src/config/env.js", () => ({
  config: { jwtSecret: "test-secret" },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// register
// -------------------------------------------------------------------
describe("authService.register", () => {
  it("should throw 409 AppError if email is already registered", async () => {
    // Simulate: user with this email already exists in DB
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "john@example.com",
    });

    await expect(
      authService.register({ name: "John", email: "john@example.com", password: "pass123" })
    ).rejects.toThrow(AppError);

    await expect(
      authService.register({ name: "John", email: "john@example.com", password: "pass123" })
    ).rejects.toThrow("Email is already registered");

    // createUser should never be called if email already exists
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  it("should register the user and return a token + user without password", async () => {
    // No existing user found
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    // bcrypt.hash returns a fake hashed password
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    // createUser returns the full user object (including password)
    (userRepository.createUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "John",
      email: "john@example.com",
      role: "STUDENT",
      password: "hashed-password", // this should NOT appear in the result
    });

    // jwt.sign returns a fake token
    (jwt.sign as jest.Mock).mockReturnValue("fake-jwt-token");

    const result = await authService.register({
      name: "John",
      email: "john@example.com",
      password: "pass123",
    });

    // Password should be hashed before saving
    expect(bcrypt.hash).toHaveBeenCalledWith("pass123", 10);

    // A token should be generated
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user-1", role: "STUDENT" },
      "test-secret"
    );

    // The result has a token
    expect(result.token).toBe("fake-jwt-token");

    // IMPORTANT: password must be stripped from the returned user
    expect(result.user).not.toHaveProperty("password");
    expect(result.user.email).toBe("john@example.com");
  });
});

// -------------------------------------------------------------------
// login
// -------------------------------------------------------------------
describe("authService.login", () => {
  it("should throw 401 AppError if no user found with that email", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login("nobody@example.com", "pass123")
    ).rejects.toThrow("Invalid email or password");
  });

  it("should throw 401 AppError if password does not match", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "john@example.com",
      password: "hashed-password",
      role: "STUDENT",
    });

    // bcrypt.compare returns false = wrong password
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login("john@example.com", "wrong-password")
    ).rejects.toThrow("Invalid email or password");
  });

  it("should return a token + user without password on successful login", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "John",
      email: "john@example.com",
      password: "hashed-password", // stored hash
      role: "STUDENT",
    });

    // bcrypt.compare returns true = correct password
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("fake-jwt-token");

    const result = await authService.login("john@example.com", "pass123");

    expect(bcrypt.compare).toHaveBeenCalledWith("pass123", "hashed-password");
    expect(result.token).toBe("fake-jwt-token");

    // Password must NOT be in the response
    expect(result.user).not.toHaveProperty("password");
    expect(result.user.email).toBe("john@example.com");
  });
});

describe("authService.registerInstructorApproval", () => {
  it("should throw 409 AppError if email is already registered", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "instructor@example.com",
      approvalStatus: "APPROVED",
    });

    await expect(
      authService.registerInstructorApproval({ name: "Inst", email: "instructor@example.com", password: "pass" })
    ).rejects.toThrow("Email is already registered");
  });

  it("should create user in DB with PENDING approval status and send email to admin", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-pass");
    (userRepository.createUser as jest.Mock).mockResolvedValue({
      id: "inst-1",
      name: "Inst",
      email: "instructor@example.com",
      role: "INSTRUCTOR",
      approvalStatus: "PENDING",
      password: "hashed-pass",
    });

    const result = await authService.registerInstructorApproval({
      name: "Inst",
      email: "instructor@example.com",
      password: "pass",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      name: "Inst",
      email: "instructor@example.com",
      password: "hashed-pass",
      role: "INSTRUCTOR",
      approvalStatus: "PENDING",
      bio: undefined,
    });
    expect(emailService.sendAdminApprovalEmail).toHaveBeenCalledWith({
      instructorName: "Inst",
      instructorEmail: "instructor@example.com",
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Instructor registration submitted for admin approval.");
    expect(result.user).not.toHaveProperty("password");
  });
});
