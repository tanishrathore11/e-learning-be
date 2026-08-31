import { emailService } from "../../../src/util/mailer.js";
import nodemailer from "nodemailer";
import { config } from "../../../src/config/secrets.js";
import { logger } from "../../../src/util/logger.js";

jest.mock("nodemailer", () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true),
    }),
  };
});
jest.mock("../../../src/util/logger.js", () => {
  return {
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
});

describe("mailer", () => {
  let transporter: any;
  const originalSmtpUser = config.smtpUser;

  beforeEach(() => {
    jest.clearAllMocks();
    transporter = nodemailer.createTransport({});
  });

  afterAll(() => {
    config.smtpUser = originalSmtpUser;
  });

  describe("sendAdminApprovalEmail", () => {
    it("should send email when smtpUser is configured", async () => {
      config.smtpUser = "test@example.com";
      await emailService.sendAdminApprovalEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
        approvalToken: "token123",
      });
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(transporter.sendMail.mock.calls[0][0].to).toBe(config.adminEmail || "admin@example.com");
      expect(transporter.sendMail.mock.calls[0][0].html).toContain("token123");
    });

    it("should send email when smtpUser is configured (without token)", async () => {
      config.smtpUser = "test@example.com";
      await emailService.sendAdminApprovalEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(transporter.sendMail.mock.calls[0][0].html).toContain("dashboard");
    });

    it("should only log when smtpUser is not configured", async () => {
      config.smtpUser = "";
      await emailService.sendAdminApprovalEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(transporter.sendMail).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it("should log when sendMail fails", async () => {
      config.smtpUser = "test@example.com";
      transporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));
      await emailService.sendAdminApprovalEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("sendInstructorWelcomeEmail", () => {
    it("should send welcome email when smtpUser is configured", async () => {
      config.smtpUser = "test@example.com";
      await emailService.sendInstructorWelcomeEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(transporter.sendMail.mock.calls[0][0].to).toBe("inst@example.com");
    });

    it("should only log when smtpUser is not configured", async () => {
      config.smtpUser = "";
      await emailService.sendInstructorWelcomeEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(transporter.sendMail).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it("should log when sendMail fails", async () => {
      config.smtpUser = "test@example.com";
      transporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));
      await emailService.sendInstructorWelcomeEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("sendInstructorRejectionEmail", () => {
    it("should send rejection email when smtpUser is configured", async () => {
      config.smtpUser = "test@example.com";
      await emailService.sendInstructorRejectionEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(transporter.sendMail.mock.calls[0][0].to).toBe("inst@example.com");
    });

    it("should only log when smtpUser is not configured", async () => {
      config.smtpUser = "";
      await emailService.sendInstructorRejectionEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(transporter.sendMail).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it("should log when sendMail fails", async () => {
      config.smtpUser = "test@example.com";
      transporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));
      await emailService.sendInstructorRejectionEmail({
        instructorName: "Test Instructor",
        instructorEmail: "inst@example.com",
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
