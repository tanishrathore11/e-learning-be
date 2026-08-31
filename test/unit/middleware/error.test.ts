import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { errorHandler } from "../../../src/middleware/error.js";
import { AppError } from "../../../src/util/appError.js";

import { logger } from "../../../src/util/logger.js";

// Build fake req/res/next — same pattern as controller tests
const mockRequest = {} as Request;
const mockNext = jest.fn() as unknown as NextFunction;

// res needs status().json() chaining
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

jest.mock("../../../src/util/logger.js", () => ({
  logger: {
    error: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("errorHandler middleware", () => {
  // -------------------------------------------------------------------
  // Case 1: AppError (our custom operational error)
  // -------------------------------------------------------------------
  it("should respond with AppError's statusCode and message", () => {
    const error = new AppError("Course not found", 404);

    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Course not found",
    });
  });

  // -------------------------------------------------------------------
  // Case 2: ZodError (validation failure)
  // -------------------------------------------------------------------
  it("should respond with 400 and formatted field errors for a ZodError", () => {
    // Build a minimal ZodError manually
    const zodIssue: ZodIssue = {
      code: "too_small",
      minimum: 1,
      type: "string",
      inclusive: true,
      path: ["email"],
      message: "Email is required",
    };
    const zodError = new ZodError([zodIssue]);

    errorHandler(zodError, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: [{ field: "email", message: "Email is required" }],
    });
  });

  // -------------------------------------------------------------------
  // Case 3: Unknown / unexpected error
  // -------------------------------------------------------------------
  it("should respond with 500 for any unknown error", () => {
    const unknownError = new Error("Something exploded in the database");

    errorHandler(unknownError, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "An unexpected internal server error occurred",
    });
  });
});
