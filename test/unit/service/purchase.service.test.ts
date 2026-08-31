import { purchaseService } from "../../../src/service/purchase.service.js";
import { purchaseRepository } from "../../../src/database/repository/purchase.repository.js";
import { courseRepository } from "../../../src/database/repository/course.repository.js";
import { enrollmentRepository } from "../../../src/database/repository/enrollment.repository.js";
import { AppError } from "../../../src/util/appError.js";

// Mock all repositories
jest.mock("../../../src/database/repository/purchase.repository.js");
jest.mock("../../../src/database/repository/course.repository.js");
jest.mock("../../../src/database/repository/enrollment.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("purchaseService.createPurchase", () => {
  // -------------------------------------------------------------------
  // Case 1: Empty items array
  // -------------------------------------------------------------------
  it("should throw 400 AppError if no items are provided", async () => {
    await expect(purchaseService.createPurchase("user-1", [])).rejects.toThrow(
      "At least one course is required to make a purchase"
    );
    // Repository should never be called
    expect(purchaseRepository.createPurchase).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Case 2: Duplicate courses in the same request
  // -------------------------------------------------------------------
  it("should throw 400 AppError if the same courseId appears twice", async () => {
    const items = [{ courseId: "course-1" }, { courseId: "course-1" }];

    await expect(purchaseService.createPurchase("user-1", items)).rejects.toThrow(
      "Duplicate courses found in purchase request"
    );
  });

  // -------------------------------------------------------------------
  // Case 3: Course does not exist
  // -------------------------------------------------------------------
  it("should throw 404 AppError if a course is not found", async () => {
    const items = [{ courseId: "bad-course" }];

    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue(null);

    await expect(purchaseService.createPurchase("user-1", items)).rejects.toThrow(
      'Course with id "bad-course" not found'
    );
  });

  // -------------------------------------------------------------------
  // Case 4: User is already enrolled in a course
  // -------------------------------------------------------------------
  it("should throw 409 AppError if user is already enrolled in a course", async () => {
    const items = [{ courseId: "course-1" }];

    (courseRepository.findCourseByIdWithDetails as jest.Mock).mockResolvedValue({
      id: "course-1",
      title: "JS Basics",
      price: 99,
    });
    // Simulate existing enrollment found
    (enrollmentRepository.findEnrollment as jest.Mock).mockResolvedValue({ id: "enrollment-1" });

    await expect(purchaseService.createPurchase("user-1", items)).rejects.toThrow(
      'You are already enrolled in "JS Basics"'
    );
  });

  // -------------------------------------------------------------------
  // Case 5: Successful purchase — happy path
  // -------------------------------------------------------------------
  it("should create a purchase with the correct total amount on success", async () => {
    const items = [{ courseId: "course-1" }, { courseId: "course-2" }];

    (courseRepository.findCourseByIdWithDetails as jest.Mock)
      .mockResolvedValueOnce({ id: "course-1", title: "JS Basics", price: 100 })
      .mockResolvedValueOnce({ id: "course-2", title: "TS Advanced", price: 200 });

    // No existing enrollment for either
    (enrollmentRepository.findEnrollment as jest.Mock).mockResolvedValue(null);

    const mockPurchase = { id: "purchase-1", totalAmount: 300 };
    (purchaseRepository.createPurchase as jest.Mock).mockResolvedValue(mockPurchase);

    const result = await purchaseService.createPurchase("user-1", items);

    // Total amount should be 100 + 200 = 300
    expect(purchaseRepository.createPurchase).toHaveBeenCalledWith({
      userId: "user-1",
      totalAmount: 300,
      items: [
        { courseId: "course-1", price: 100 },
        { courseId: "course-2", price: 200 },
      ],
    });
    expect(result).toEqual(mockPurchase);
  });
});

// -------------------------------------------------------------------
// getMyPurchases
// -------------------------------------------------------------------
describe("purchaseService.getMyPurchases", () => {
  it("should return purchases for a user", async () => {
    const mockPurchases = [{ id: "purchase-1" }];
    (purchaseRepository.findPurchasesByUserId as jest.Mock).mockResolvedValue(mockPurchases);

    const result = await purchaseService.getMyPurchases("user-1");
    expect(result).toEqual(mockPurchases);
    expect(purchaseRepository.findPurchasesByUserId).toHaveBeenCalledWith("user-1");
  });
});
