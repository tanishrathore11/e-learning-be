import { Request, Response, NextFunction } from "express";
import { purchaseController } from "../../../../src/api/controller/purchase.controller.js";
import { purchaseService } from "../../../../src/service/purchase.service.js";

// Mock the entire purchase service so we don't hit the database
jest.mock("../../../../src/service/purchase.service.js");

// -------------------------------------------------------------------
// Shared test helpers (same pattern as auth.controller.test.ts)
// -------------------------------------------------------------------
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as unknown as NextFunction;

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// createPurchase
// -------------------------------------------------------------------
describe("purchaseController.createPurchase", () => {
  it("should create a purchase and return 201", async () => {
    const mockRequest = {
      body: { items: ["course-1", "course-2"] },
      user: { id: "user-1", role: "student" },
    } as unknown as Request;

    const mockPurchase = { id: "purchase-1", userId: "user-1" };
    (purchaseService.createPurchase as jest.Mock).mockResolvedValue(mockPurchase);

    await purchaseController.createPurchase(mockRequest, mockResponse, mockNext);

    // userId comes from JWT (req.user), NOT from the body
    expect(purchaseService.createPurchase).toHaveBeenCalledWith(
      "user-1",
      ["course-1", "course-2"]
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockPurchase,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {
      body: { items: ["course-1"] },
      user: { id: "user-1", role: "student" },
    } as unknown as Request;

    const error = new Error("Already purchased");
    (purchaseService.createPurchase as jest.Mock).mockRejectedValue(error);

    await purchaseController.createPurchase(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// getMyPurchases
// -------------------------------------------------------------------
describe("purchaseController.getMyPurchases", () => {
  it("should return all purchases for the logged-in user with status 200", async () => {
    const mockRequest = {
      user: { id: "user-1", role: "student" },
    } as unknown as Request;

    const mockPurchases = [
      { id: "purchase-1", courseId: "course-1" },
      { id: "purchase-2", courseId: "course-2" },
    ];
    (purchaseService.getMyPurchases as jest.Mock).mockResolvedValue(mockPurchases);

    await purchaseController.getMyPurchases(mockRequest, mockResponse, mockNext);

    expect(purchaseService.getMyPurchases).toHaveBeenCalledWith("user-1");
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockPurchases,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with an error if the service throws", async () => {
    const mockRequest = {
      user: { id: "user-1", role: "student" },
    } as unknown as Request;

    const error = new Error("User not found");
    (purchaseService.getMyPurchases as jest.Mock).mockRejectedValue(error);

    await purchaseController.getMyPurchases(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
