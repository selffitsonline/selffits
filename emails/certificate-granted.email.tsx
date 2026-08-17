import React from "react";

interface CertificateGrantedEmailProps {
  name: string;
  certTitle: string;
  certNumber: string;
  downloadUrl: string;
}

export function CertificateGrantedEmail({
  name,
  certTitle,
  certNumber,
  downloadUrl,
}: CertificateGrantedEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#0A0B0E", color: "#FFFFFF", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#14161D", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", padding: "32px", textAlign: "center" }}>
        <h1 style={{ color: "#E50914", margin: "0 0 16px 0", fontSize: "28px" }}>SELFFITS</h1>
        <h2 style={{ color: "#F59E0B", fontSize: "20px", marginBottom: "16px" }}>Congratulations, {name}!</h2>
        <p style={{ color: "#9CA3AF", lineHeight: "1.6", marginBottom: "24px" }}>
          You have officially passed your evaluation and earned your <strong>{certTitle}</strong>!
        </p>

        <div style={{ backgroundColor: "#0F1117", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
          <p style={{ color: "#FFFFFF", margin: "0 0 8px 0", fontSize: "14px" }}><strong>Certificate Title:</strong> {certTitle}</p>
          <p style={{ color: "#9CA3AF", margin: "0", fontSize: "12px" }}><strong>Registration No:</strong> {certNumber}</p>
        </div>

        <a
          href={downloadUrl}
          style={{ display: "inline-block", backgroundColor: "#0080FF", color: "#FFFFFF", fontWeight: "bold", textDecoration: "none", padding: "14px 28px", borderRadius: "8px", fontSize: "16px" }}
        >
          Download Official Certificate PDF
        </a>

        <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "32px" }}>
          Your certificate is permanently archived in your SELFFITS Student Dashboard.
        </p>
      </div>
    </div>
  );
}
