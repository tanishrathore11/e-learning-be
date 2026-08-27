import nodemailer from "nodemailer";
import { config } from "../config/env.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: Number(config.smtpPort),
  auth: {
    user: config.smtpUser,
    pass: config.smtpPassword,
  },
});

interface AdminApprovalEmailInput {
  instructorName: string;
  instructorEmail: string;
  approvalToken: string;
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
    const approvalLink = `${config.frontendUrl}/admin/approve-instructor?token=${approvalToken}`;

    const mailOptions = {
      from: config.smtpUser || '"E-Learning Platform" <noreply@elearning.com>',
      to: config.adminEmail || "admin@example.com",
      subject: `New Instructor Registration: ${instructorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">New Instructor Approval Request</h2>
          <p>A new instructor has registered and requires approval to access the platform:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px 0;">${instructorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${instructorEmail}</td>
            </tr>
          </table>
          <p style="margin-bottom: 30px;">Click the button below to review and approve this request:</p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${approvalLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Approve Instructor</a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            If the button doesn't work, copy and paste this link in your browser:<br/>
            <a href="${approvalLink}">${approvalLink}</a>
          </p>
        </div>
      `,
    };

    try {
      if (!config.smtpUser) {
        console.warn("SMTP user is not configured. Logging approval email details instead:");
        console.log(`[EMAIL] To Admin (${mailOptions.to}): Approve Instructor ${instructorName} (${instructorEmail}). Link: ${approvalLink}`);
        return;
      }
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Sent approval email to ${mailOptions.to} for instructor ${instructorName}`);
    } catch (err) {
      console.error("Failed to send admin approval email via SMTP. Logging details to console as fallback:", err);
      console.log(`[EMAIL FALLBACK] Link: ${approvalLink}`);
    }
  },

  async sendInstructorWelcomeEmail({
    instructorName,
    instructorEmail,
  }: InstructorWelcomeEmailInput): Promise<void> {
    const mailOptions = {
      from: config.smtpUser || '"E-Learning Platform" <noreply@elearning.com>',
      to: instructorEmail,
      subject: "Your instructor account has been approved!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #10b981; margin-bottom: 20px;">Welcome to the E-Learning Platform!</h2>
          <p>Hello ${instructorName},</p>
          <p>Your instructor account has been approved. Welcome to the e-learning platform.</p>
          <p>You can now sign in to your account and start creating your courses.</p>
          <p style="margin-top: 30px;">Best regards,<br/>The E-Learning Team</p>
        </div>
      `,
    };

    try {
      if (!config.smtpUser) {
        console.warn("SMTP user is not configured. Logging welcome email details instead:");
        console.log(`[EMAIL] To Instructor (${mailOptions.to}): ${instructorName} approved successfully.`);
        return;
      }
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Sent welcome email to instructor ${instructorEmail}`);
    } catch (err) {
      console.error("Failed to send welcome email via SMTP. Logging details to console as fallback:", err);
      console.log(`[EMAIL FALLBACK] Welcome email for instructor ${instructorName} (${instructorEmail})`);
    }
  },
};
