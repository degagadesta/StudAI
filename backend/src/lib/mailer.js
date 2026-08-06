import nodemailer from "nodemailer";

const isDevelopment = process.env.NODE_ENV !== "production";
const skipEmail = process.env.SKIP_EMAIL === "true";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true only if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add timeout and connection settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

export async function sendMail({ to, subject, html }) {
  // In development, if SKIP_EMAIL is true, just log the email instead of sending
  if (isDevelopment && skipEmail) {
    console.log("\n📧 EMAIL (Not Sent - Development Mode):");
    console.log("=====================================");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    console.log("=====================================\n");
    
    // Extract verification/reset link from HTML for easy testing
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch) {
      console.log(`🔗 LINK TO COPY: ${linkMatch[1]}\n`);
    }
    
    return Promise.resolve(); // Simulate successful send
  }

  try {
    // Try to send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    
    console.log(`✅ Email sent successfully to ${to}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    
    // In development, log the email content so user can still access the link
    if (isDevelopment) {
      console.log("\n📧 EMAIL CONTENT (Failed to send):");
      console.log("===================================");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      
      // Extract and display the verification/reset link
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`\n🔗 VERIFICATION/RESET LINK:\n${linkMatch[1]}\n`);
        console.log("👆 Copy this link and paste it in your browser to verify/reset\n");
      }
      console.log("===================================\n");
      
      // Don't throw error in development - allow registration to continue
      return Promise.resolve();
    }
    
    // In production, throw the error
    throw error;
  }
}
