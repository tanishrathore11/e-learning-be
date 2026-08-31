import { Request, Response, NextFunction } from "express";
import { authorizeRole } from "../../../src/middleware/authorize-role.js";
import { AppError } from "../../../src/util/appError.js";

const mockResponse = {} as Response;
const mockNext = jest.fn() as unknown as NextFunction;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authorizeRole", () => {
  // -------------------------------------------------------------------
  // Case 1: No req.user (authenticateRequest middleware was skipped)
  // -------------------------------------------------------------------
  it("should call next with 401 AppError if req.user is not set", () => {
    const mockRequest = {} as Request; // no user attached

    // authorizeRole returns a middleware function, so we call it immediately
    const middleware = authorizeRole("ADMIN");
    middleware(mockRequest, mockResponse, mockNext);

    const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe("Authentication required");
    expect(error.statusCode).toBe(401);
  });

  // -------------------------------------------------------------------
  // Case 2: User has wrong role
  // -------------------------------------------------------------------
  it("should call next with 403 AppError if user's role is not allowed", () => {
    const mockRequest = {
      user: { id: "user-1", role: "STUDENT" },
    } as unknown as Request;

    // Only INSTRUCTOR and ADMIN are allowed
    const middleware = authorizeRole("ADMIN", "INSTRUCTOR");
    middleware(mockRequest, mockResponse, mockNext);

    const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe("Access denied. Required role(s): ADMIN, INSTRUCTOR");
    expect(error.statusCode).toBe(403);
  });

  // -------------------------------------------------------------------
  // Case 3: User has correct role — happy path
  // -------------------------------------------------------------------
  it("should call next() with no error if user's role is allowed", () => {
    const mockRequest = {
      user: { id: "user-1", role: "INSTRUCTOR" },
    } as unknown as Request;

    const middleware = authorizeRole("ADMIN", "INSTRUCTOR");
    middleware(mockRequest, mockResponse, mockNext);

    // next() called with no arguments means "continue, no error"
    expect(mockNext).toHaveBeenCalledWith();
  });

  // -------------------------------------------------------------------
  // Case 4: Single role check
  // -------------------------------------------------------------------
  it("should allow ADMIN when only ADMIN role is required", () => {
    const mockRequest = {
      user: { id: "admin-1", role: "ADMIN" },
    } as unknown as Request;

    const middleware = authorizeRole("ADMIN");
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});
