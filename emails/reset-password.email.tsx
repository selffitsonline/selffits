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
