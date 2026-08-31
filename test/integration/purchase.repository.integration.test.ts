import "reflect-metadata";
import "dotenv/config";
import { TestDataSource } from "./test-data-source.js";
import { AppDataSource } from "../../src/database/db-connection.js";
import { purchaseRepository } from "../../src/database/repository/purchase.repository.js";
import { Topic, User, Course, PurchaseItem, Enrollment } from "../../src/database/model/index.js";

describe("purchaseRepository (integration)", () => {
  let userId: string;
  let courseId: string;
  let coursePrice: number = 49.99;

  beforeAll(async () => {
    await TestDataSource.initialize();
    Object.assign(AppDataSource, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.query(`TRUNCATE TABLE enrollments, "purchase_items", purchases, courses, users, topics CASCADE`);
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.query(`TRUNCATE TABLE enrollments, "purchase_items", purchases, courses, users, topics CASCADE`);

    // Seed Topic
    const topicRepo = TestDataSource.getRepository(Topic);
    const topic = await topicRepo.save(topicRepo.create({ name: "Business" }));

    // Seed Instructor & Student
    const userRepo = TestDataSource.getRepository(User);
    const instructor = await userRepo.save(
      userRepo.create({ name: "Instructor", email: "ins@test.com", password: "pwd", role: "INSTRUCTOR" })
    );
    const student = await userRepo.save(
      userRepo.create({ name: "Student", email: "student@test.com", password: "pwd", role: "STUDENT" })
    );
    userId = student.id;

    // Seed Course
    const courseRepo = TestDataSource.getRepository(Course);
    const course = await courseRepo.save(
      courseRepo.create({ title: "Negotiation 101", price: coursePrice, topic, instructor })
    );
    courseId = course.id;
  });

  describe("createPurchase", () => {
    it("should process purchase, create purchase items, and enroll student inside a transaction", async () => {
      const purchase = await purchaseRepository.createPurchase({
        userId,
        totalAmount: coursePrice,
        items: [{ courseId, price: coursePrice }],
      });

      expect(purchase.id).toBeDefined();
      expect(Number(purchase.totalAmount)).toBe(coursePrice);

      // Verify PurchaseItem was created
      const purchaseItemCount = await TestDataSource.getRepository(PurchaseItem).count();
      expect(purchaseItemCount).toBe(1);

      const purchaseItem = await TestDataSource.getRepository(PurchaseItem).findOne({
        where: { purchase: { id: purchase.id } },
        relations: { course: true }
      });
      expect(purchaseItem).not.toBeNull();
      expect(purchaseItem!.course.id).toBe(courseId);
      expect(Number(purchaseItem!.amount)).toBe(coursePrice);

      // Verify Enrollment was automatically created
      const enrollmentCount = await TestDataSource.getRepository(Enrollment).count();
      expect(enrollmentCount).toBe(1);

      const enrollment = await TestDataSource.getRepository(Enrollment).findOne({
        where: { user: { id: userId }, course: { id: courseId } }
      });
      expect(enrollment).not.toBeNull();
    });
  });

  describe("findPurchasesByUserId", () => {
    it("should return all purchases with items and courses for the user", async () => {
      // Create a purchase first
      await purchaseRepository.createPurchase({
        userId,
        totalAmount: coursePrice,
        items: [{ courseId, price: coursePrice }],
      });

      const purchases = await purchaseRepository.findPurchasesByUserId(userId);
      expect(purchases).toHaveLength(1);
      expect(purchases[0].items).toHaveLength(1);
      expect(purchases[0].items[0].course.id).toBe(courseId);
    });
  });

  describe("findPurchaseItemByCourseId", () => {
    it("should find the purchase item details by course id", async () => {
      await purchaseRepository.createPurchase({
        userId,
        totalAmount: coursePrice,
        items: [{ courseId, price: coursePrice }],
      });

      const purchaseItem = await purchaseRepository.findPurchaseItemByCourseId(courseId);
      expect(purchaseItem).not.toBeNull();
      expect(Number(purchaseItem!.amount)).toBe(coursePrice);
    });
  });
});
