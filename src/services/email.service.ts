/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

import nodemailer from "nodemailer";
import { generateWealthBlueprintPDF, getPDFFilename } from "./pdf.service";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

/**
 * Create email transporter
 * Uses Nodemailer's test account for development (no config needed)
 * Falls back to SMTP if credentials are provided
 */
async function createTransporter() {
  // If email credentials are provided, use SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
    return nodemailer.createTransport(config);
  }

  // Otherwise, use Nodemailer's test account (fake SMTP for development)
  console.log("📧 Using Nodemailer test account (development mode - no config needed)");
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Send email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = await createTransporter();
    
    const fromEmail = process.env.EMAIL_USER || "noreply@myrtlewealth.com";
    const mailOptions: any = {
      from: `"Myrtle Wealth" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Plain text version
      html: options.html,
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    
    // If using test account, log the preview URL
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("✅ Email sent (Test Account):");
        console.log(`   📧 Preview URL: ${previewUrl}`);
        console.log(`   👆 Click the URL above to view the email in your browser`);
        console.log(`   📬 Sent to: ${options.to}`);
      }
    } else {
      console.log("✅ Email sent successfully:", {
        to: options.to,
        messageId: info.messageId,
      });
    }
    return true;
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

/**
 * Send email with attachment (wrapper for sendEmail)
 */
export async function sendEmailWithAttachment(options: SendEmailOptions): Promise<boolean> {
  return await sendEmail(options);
}

/**
 * Send onboarding email with wealth blueprint
 */
export async function sendOnboardingEmail(
  email: string,
  fullName: string,
  narrative: string,
  analysisData: {
    netWorth: number;
    netWorthBand: string;
    riskScore: number;
    riskProfile: string;
    persona: string;
    portfolio: Record<string, any>;
  },
  submissionId: string
): Promise<boolean> {
  const subject = "🌿 Your Myrtle Wealth Blueprint is Ready!";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          color: #27dc85;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
          white-space: pre-wrap;
          font-family: monospace;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #27dc85;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: bold;
        }
        .highlight {
          color: #27dc85;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌿 Myrtle Wealth</div>
          <h1>Your Wealth Blueprint is Ready!</h1>
        </div>
        
        <div class="greeting">
          <p>Dear ${fullName},</p>
          <p>Thank you for completing the Myrtle Wealth Blueprint Questionnaire!</p>
        </div>
        
        <p>We've analyzed your responses and created a personalized wealth blueprint just for you.</p>
        
        <div class="content">
          <strong>Your Financial Profile:</strong>
          <ul>
            <li><strong>Persona:</strong> <span class="highlight">${analysisData.persona}</span></li>
            <li><strong>Net Worth Band:</strong> <span class="highlight">${analysisData.netWorthBand}</span></li>
            <li><strong>Risk Profile:</strong> <span class="highlight">${analysisData.riskProfile}</span></li>
          </ul>
        </div>
        
        <div class="content">
          ${narrative.replace(/\n/g, "<br>")}
        </div>
        
        <p style="text-align: center;">
          <strong>📎 Your personalized Wealth Blueprint PDF is attached to this email.</strong>
        </p>
        
        <p>Our team is here to help you build a confident, structured, long-term financial future.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 15px;"><strong>Get Started on Myrtle Portal:</strong></p>
          <a href="https://myrtle.portal.prod.mywealthcare.io/auth/signup" class="button" style="margin-right: 10px;">Create Account</a>
          <a href="https://myrtle.portal.prod.mywealthcare.io/auth/signin" class="button" style="background-color: #333; margin-left: 10px;">Sign In</a>
        </div>
        
        <div class="footer">
          <p>Best regards,<br><strong>The Myrtle Wealth Team</strong></p>
          <p style="font-size: 12px; color: #999;">
            This email was sent to ${email}. If you have any questions, please contact our support team.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">
            <a href="https://myrtle.portal.prod.mywealthcare.io/auth/signup" style="color: #27dc85;">Create Account</a> | 
            <a href="https://myrtle.portal.prod.mywealthcare.io/auth/signin" style="color: #27dc85;">Sign In</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Generate PDF attachment
  console.log("   📄 Generating PDF for email attachment...");
  try {
    const pdfBuffer = await generateWealthBlueprintPDF(
      narrative,
      {
        fullName,
        email,
        createdAt: new Date(),
      },
      analysisData
    );

    const pdfFilename = getPDFFilename(fullName, submissionId);
    console.log(`   ✅ PDF generated: ${pdfFilename} (${pdfBuffer.length} bytes)`);

    return await sendEmail({
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error: any) {
    console.error("   ⚠️  Failed to generate PDF, sending email without attachment:", error);
    // Send email without PDF if generation fails
    return await sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("✅ Using Nodemailer test account (development mode)");
      console.log("   📧 Emails will be sent to a test inbox");
      console.log("   🔗 Preview URLs will be logged in console when emails are sent");
    } else {
      console.log("✅ Email server is ready to send messages (SMTP)");
    }
    return true;
  } catch (error: any) {
    console.error("❌ Email server configuration error:", error.message);
    return false;
  }
}

