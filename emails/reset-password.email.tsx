import React from "react";

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#0A0B0E", color: "#FFFFFF", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#14161D", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", padding: "32px", textAlign: "center" }}>
        <h1 style={{ color: "#E50914", margin: "0 0 16px 0", fontSize: "28px" }}>SELFFITS</h1>
        <h2 style={{ color: "#FFFFFF", fontSize: "20px", marginBottom: "16px" }}>Reset Your Password</h2>
        <p style={{ color: "#9CA3AF", lineHeight: "1.6", marginBottom: "24px" }}>
          Hello {name}, we received a request to reset your password for your SELFFITS Academy account. Click the button below to choose a new password:
        </p>
        <a
          href={resetUrl}
          style={{ display: "inline-block", backgroundColor: "#E50914", color: "#FFFFFF", fontWeight: "bold", textDecoration: "none", padding: "14px 28px", borderRadius: "8px", fontSize: "16px" }}
        >
          Reset Password
        </a>
        <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "32px" }}>
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  );
}

export function renderResetPasswordEmailHtml(name: string, resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your SELFFITS Account Password</title>
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0B0E; color: #FFFFFF;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #14161D; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 36px; text-align: center;">
    <h1 style="color: #E50914; margin: 0 0 6px 0; font-size: 32px; font-weight: 900; letter-spacing: 1.5px;">SELFFITS</h1>
    <p style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px 0; font-weight: 600;">Global Online Academy</p>
    
    <h2 style="color: #FFFFFF; font-size: 20px; margin-bottom: 14px; font-weight: 700;">Reset Your Password</h2>
    <p style="color: #D1D5DB; line-height: 1.6; margin-bottom: 24px; font-size: 14px;">
      Hello ${name}, we received a request to reset your password for your SELFFITS Academy account. Click the button below to choose a strong new password:
    </p>

    <div style="margin: 28px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #E50914; color: #FFFFFF; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">
        Reset Password
      </a>
    </div>

    <p style="color: #F59E0B; font-size: 12px; font-weight: 700; margin: 20px 0 8px 0;">
      ⏳ This password reset link is valid for 1 hour.
    </p>

    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; margin-top: 24px;">
      <p style="color: #6B7280; font-size: 11px; margin: 0 0 6px 0;">
        Or copy and paste this reset URL into your browser:
      </p>
      <p style="color: #38BDF8; font-size: 11px; word-break: break-all; margin: 0;">
        ${resetUrl}
      </p>
    </div>

    <p style="color: #6B7280; font-size: 11px; margin-top: 24px; margin-bottom: 0;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;
}
