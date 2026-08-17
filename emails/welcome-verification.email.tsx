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
        <h1 style={{ color: "#E50914", margin: "0 0 16px 0", fontSize: "28px" }}>SELFFITS</h1>
        <h2 style={{ color: "#FFFFFF", fontSize: "20px", marginBottom: "16px" }}>Welcome to the Academy, {name}!</h2>
        <p style={{ color: "#9CA3AF", lineHeight: "1.6", marginBottom: "24px" }}>
          Thank you for signing up for SELFFITS Global Online Fitness & Martial Arts Academy. Please verify your email address to activate your account.
        </p>
        <a
          href={verificationUrl}
          style={{ display: "inline-block", backgroundColor: "#E50914", color: "#FFFFFF", fontWeight: "bold", textDecoration: "none", padding: "14px 28px", borderRadius: "8px", fontSize: "16px" }}
        >
          Verify Email Address
        </a>
        <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "32px" }}>
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
}
