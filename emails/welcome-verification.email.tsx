import React from "react";

interface WelcomeVerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export function WelcomeVerificationEmail({
  name,
  verificationUrl,
}: WelcomeVerificationEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#0A0B0E", color: "#FFFFFF", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#14161D", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", padding: "32px", textAlign: "center" }}>
        <h1 style={{ color: "#E50914", margin: "0 0 8px 0", fontSize: "30px", fontWeight: "900", letterSpacing: "1px" }}>SELFFITS</h1>
        <p style={{ color: "#9CA3AF", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 24px 0" }}>Online Academy</p>
        
        <h2 style={{ color: "#FFFFFF", fontSize: "22px", marginBottom: "16px", fontWeight: "700" }}>Welcome, {name}!</h2>
        <p style={{ color: "#D1D5DB", lineHeight: "1.6", marginBottom: "20px", fontSize: "14px" }}>
          Thank you for signing up for SELFFITS Global Online Fitness & Martial Arts Academy. To complete your registration and secure your student account, please verify your email address.
        </p>

        <div style={{ margin: "28px 0" }}>
          <a
            href={verificationUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#E50914",
              color: "#FFFFFF",
              fontWeight: "bold",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: "8px",
              fontSize: "15px",
              letterSpacing: "0.5px",
            }}
          >
            Verify Email Address
          </a>
        </div>

        <p style={{ color: "#F59E0B", fontSize: "13px", fontWeight: "600", margin: "20px 0 10px 0" }}>
          ⏳ This verification link is valid for 24 hours.
        </p>

        <p style={{ color: "#9CA3AF", fontSize: "12px", lineHeight: "1.5", margin: "0 0 24px 0" }}>
          If the link expires before you verify, you can easily request a replacement verification link directly from our login page at any time.
        </p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginTop: "24px" }}>
          <p style={{ color: "#6B7280", fontSize: "11px", wordBreak: "break-all", margin: "0 0 8px 0" }}>
            Or copy and paste this verification URL into your browser:
          </p>
          <p style={{ color: "#3B82F6", fontSize: "11px", wordBreak: "break-all", margin: 0 }}>
            {verificationUrl}
          </p>
        </div>

        <p style={{ color: "#6B7280", fontSize: "11px", marginTop: "24px", marginBottom: 0 }}>
          If you did not register for SELFFITS Academy, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
}

export function renderWelcomeVerificationEmailHtml(name: string, verificationUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your SELFFITS Academy Account</title>
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0B0E; color: #FFFFFF;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #14161D; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 36px; text-align: center;">
    <h1 style="color: #E50914; margin: 0 0 6px 0; font-size: 32px; font-weight: 900; letter-spacing: 1.5px;">SELFFITS</h1>
    <p style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px 0; font-weight: 600;">Global Online Academy</p>
    
    <h2 style="color: #FFFFFF; font-size: 20px; margin-bottom: 14px; font-weight: 700;">Welcome, ${name}!</h2>
    <p style="color: #D1D5DB; line-height: 1.6; margin-bottom: 24px; font-size: 14px;">
      Thank you for signing up for SELFFITS Online Martial Arts & Fitness Academy. To complete your registration and secure your student account, please verify your email address.
    </p>

    <div style="margin: 28px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background-color: #E50914; color: #FFFFFF; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">
        Verify Email Address
      </a>
    </div>

    <p style="color: #F59E0B; font-size: 12px; font-weight: 700; margin: 20px 0 8px 0;">
      ⏳ This verification link is valid for 24 hours.
    </p>

    <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0 0 24px 0;">
      If the link expires before you verify, you can easily request a replacement link directly on the login page at any time.
    </p>

    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; margin-top: 24px;">
      <p style="color: #6B7280; font-size: 11px; margin: 0 0 6px 0;">
        Or copy and paste this verification URL into your browser:
      </p>
      <p style="color: #38BDF8; font-size: 11px; word-break: break-all; margin: 0;">
        ${verificationUrl}
      </p>
    </div>

    <p style="color: #6B7280; font-size: 11px; margin-top: 24px; margin-bottom: 0;">
      If you did not register for SELFFITS Academy, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;
}
