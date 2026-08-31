import nodemailer from "nodemailer";
import { config } from "../config/secrets.js";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { logger } from "./logger.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: Number(config.smtpPort),
  auth: {
    user: config.smtpUser,
    pass: config.smtpPassword,
  },
});

// Load and compile templates
const getTemplate = (templateName: string) => {
  const templatePath = path.join(process.cwd(), "mail-template", `${templateName}.handlebars`);
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  return handlebars.compile(templateSource);
};

interface AdminApprovalEmailInput {
  instructorName: string;
  instructorEmail: string;
  approvalToken?: string;
}

interface InstructorWelcomeEmailInput {
  instructorName: string;
  instructorEmail: string;
}

export const emailService = {
  async sendAdminApprovalEmail({
    instructorName,
    instructorEmail,
    approvalToken,
  }: AdminApprovalEmailInput): Promise<void> {
    const approvalLink = approvalToken
      ? `${config.frontendUrl}/admin/approve-instructor?token=${approvalToken}`
      : `${config.frontendUrl}/admin/dashboard`;

    const template = getTemplate("admin-approval");
    const html = template({ instructorName, instructorEmail, approvalLink });

    const mailOptions = {
      from: config.smtpUser || '"E-Learning Platform" <noreply@elearning.com>',
      to: config.adminEmail || "admin@example.com",
      subject: `New Instructor Registration Request: ${instructorName}`,
      html,
    };

    try {
      if (!config.smtpUser) {
        logger.warn("SMTP user is not configured. Logging approval email details instead:");
        logger.info(`[EMAIL] To Admin (${mailOptions.to}): Pending Instructor Request ${instructorName} (${instructorEmail}). Dashboard: ${approvalLink}`);
        return;
      }
      await transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Sent approval email to ${mailOptions.to} for instructor ${instructorName}`);
    } catch (err) {
      logger.error({ err }, "Failed to send admin approval email via SMTP. Logging details to console as fallback:");
      logger.info(`[EMAIL FALLBACK] Link: ${approvalLink}`);
    }
  },

  async sendInstructorWelcomeEmail({
    instructorName,
    instructorEmail,
  }: InstructorWelcomeEmailInput): Promise<void> {
    const template = getTemplate("instructor-welcome");
    const html = template({ instructorName, instructorEmail });

    const mailOptions = {
      from: config.smtpUser || '"E-Learning Platform" <noreply@elearning.com>',
      to: instructorEmail,
      subject: "Your instructor account has been approved!",
      html,
    };

    try {
      if (!config.smtpUser) {
        logger.warn("SMTP user is not configured. Logging welcome email details instead:");
        logger.info(`[EMAIL] To Instructor (${mailOptions.to}): ${instructorName} approved successfully.`);
        return;
      }
      await transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Sent welcome email to instructor ${instructorEmail}`);
    } catch (err) {
      logger.error({ err }, "Failed to send welcome email via SMTP. Logging details to console as fallback:");
      logger.info(`[EMAIL FALLBACK] Welcome email for instructor ${instructorName} (${instructorEmail})`);
    }
  },

  async sendInstructorRejectionEmail({
    instructorName,
    instructorEmail,
  }: InstructorWelcomeEmailInput): Promise<void> {
    const template = getTemplate("instructor-rejection");
    const html = template({ instructorName, instructorEmail });

    const mailOptions = {
      from: config.smtpUser || '"E-Learning Platform" <noreply@elearning.com>',
      to: instructorEmail,
      subject: "Update on your instructor registration request",
      html,
    };

    try {
      if (!config.smtpUser) {
        logger.warn("SMTP user is not configured. Logging rejection email details instead:");
        logger.info(`[EMAIL] To Instructor (${mailOptions.to}): ${instructorName} registration request rejected.`);
        return;
      }
      await transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Sent rejection email to instructor ${instructorEmail}`);
    } catch (err) {
      logger.error({ err }, "Failed to send rejection email via SMTP. Logging details as fallback:");
      logger.info(`[EMAIL FALLBACK] Rejection email for instructor ${instructorName} (${instructorEmail})`);
    }
  },
};
