import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateRequest } from "./authenticate-request.js";
import { AppError } from "../utils/appError.js";
import { userRepository } from "../database/repository/user.repository.js";

// Mock the jwt library so we control what verify() returns
jest.mock("jsonwebtoken");

// Mock userRepository
jest.mock("../database/repository/user.repository.js", () => ({
  userRepository: {
    findById: jest.fn(),
  },
}));

const mockResponse = {} as Response;
const mockNext = jest.fn() as unknown as NextFunction;

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// Case 1: No Authorization header at all
// -------------------------------------------------------------------
describe("authenticateRequest", () => {
  it("should call next with 401 AppError if no Authorization header is sent", async () => {
    const mockRequest = {
      headers: {},
    } as Request;

    await authenticateRequest(mockRequest, mockResponse, mockNext);

    // next() must be called with an AppError
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));

    // Check the error message and status code
    const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe("Authentication token is missing");
    expect(error.statusCode).toBe(401);
  });

  it("should call next with 401 AppError if header does not start with 'Bearer '", async () => {
    const mockRequest = {
      headers: { authorization: "Token abc123" }, // wrong prefix
    } as unknown as Request;

    await authenticateRequest(mockRequest, mockResponse, mockNext);

    const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe("Authentication token is missing");
    expect(error.statusCode).toBe(401);
  });

  // -------------------------------------------------------------------
  // Case 2: Token present but invalid / expired
  // -------------------------------------------------------------------
  it("should call next with 401 AppError if the JWT is invalid or expired", async () => {
    const mockRequest = {
      headers: { authorization: "Bearer bad-token" },
    } as unknown as Request;

    // Simulate jwt.verify throwing (what happens with a bad token)
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid signature");
    });

    await authenticateRequest(mockRequest, mockResponse, mockNext);

    const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe("Invalid or expired authentication token");
    expect(error.statusCode).toBe(401);
  });

  it("should call next with 401 AppError if user does not exist", async () => {
    const mockRequest = {
      headers: { authorization: "Bearer valid-token" },
    } as unknown as Request;

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user-1", role: "STUDENT" });
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await authenticateRequest(mockRequest, mockResponse, mockNext);

    const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe("User associated with this token no longer exists");
    expect(error.statusCode).toBe(401);
  });

  // -------------------------------------------------------------------
  // Case 3: Valid token — happy path
  // -------------------------------------------------------------------
  it("should attach user to req and call next() with no error if token is valid", async () => {
    const mockRequest = {
      headers: { authorization: "Bearer valid-token" },
    } as unknown as Request;

    // Simulate jwt.verify returning a decoded payload
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user-1", role: "STUDENT" });
    (userRepository.findById as jest.Mock).mockResolvedValue({ id: "user-1", role: "STUDENT" });

    await authenticateRequest(mockRequest, mockResponse, mockNext);

    // req.user should be populated
    expect((mockRequest as any).user).toEqual({ id: "user-1", role: "STUDENT" });

    // next() should be called with NO arguments (no error)
    expect(mockNext).toHaveBeenCalledWith();
  });
});
