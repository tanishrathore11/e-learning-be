import { Request, Response, NextFunction } from "express";
import { authController } from "./auth.controller.js";
import { authService } from "../../service/auth.service.js";

// Mock the entire auth service so we don't hit the database
jest.mock("../../service/auth.service.js");

// -------------------------------------------------------------------
// Shared test helpers
// -------------------------------------------------------------------
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as unknown as NextFunction;

beforeEach(() => {
  // Reset all mocks before every test so they don't bleed into each other
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// register
// -------------------------------------------------------------------
describe("authController.register", () => {
  it("should register a user and return 201", async () => {
    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "secret123",
      },
    } as Request;

    const mockRegisterResult = {
      token: "fake-jwt-token",
      user: { id: "user-1", email: "john@example.com" },
    };

    (authService.register as jest.Mock).mockResolvedValue(mockRegisterResult);

    await authController.register(mockRequest, mockResponse, mockNext);

    expect(authService.register).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "secret123",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockRegisterResult,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if registration fails", async () => {
    const mockRequest = {
      body: { email: "john@example.com", password: "secret123" },
    } as Request;

    const error = new Error("Email is already registered");
    (authService.register as jest.Mock).mockRejectedValue(error);

    await authController.register(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// login
// -------------------------------------------------------------------
describe("authController.login", () => {
  it("should login the user successfully", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    } as Request;

    const mockLoginResult = {
      token: "fake-jwt-token",
      user: {
        id: "user-123",
        email: "test@example.com",
      },
    };

    (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

    await authController.login(mockRequest, mockResponse, mockNext);

    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockLoginResult,
    });

    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if login fails", async () => {
    const mockRequest = {
      body: { email: "wrong@example.com", password: "badpassword" },
    } as Request;

    const error = new Error("Invalid email or password");
    (authService.login as jest.Mock).mockRejectedValue(error);

    await authController.login(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});