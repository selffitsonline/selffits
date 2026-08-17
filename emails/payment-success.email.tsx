import React from "react";

interface PaymentSuccessEmailProps {
  name: string;
  planName: string;
  amount: string;
  currency: string;
  orderId: string;
  dashboardUrl: string;
}

export function PaymentSuccessEmail({
  name,
  planName,
  amount,
  currency,
  orderId,
  dashboardUrl,
}: PaymentSuccessEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#0A0B0E", color: "#FFFFFF", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#14161D", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", padding: "32px" }}>
        <h1 style={{ color: "#E50914", margin: "0 0 16px 0", fontSize: "28px", textAlign: "center" }}>SELFFITS</h1>
        <h2 style={{ color: "#10B981", fontSize: "20px", marginBottom: "16px", textAlign: "center" }}>Payment & Enrollment Confirmed!</h2>
        
        <p style={{ color: "#9CA3AF", lineHeight: "1.6", marginBottom: "20px" }}>
          Hello {name}, thank you for enrolling in SELFFITS Global Online Fitness & Martial Arts Academy. Your payment has been processed successfully.
        </p>

        <div style={{ backgroundColor: "#0F1117", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "20px", marginBottom: "24px" }}>
          <p style={{ color: "#FFFFFF", margin: "0 0 8px 0", fontSize: "14px" }}><strong>Program:</strong> {planName}</p>
          <p style={{ color: "#FFFFFF", margin: "0 0 8px 0", fontSize: "14px" }}><strong>Amount Paid:</strong> {currency === "INR" ? `₹${amount}` : `$${amount}`} ({currency})</p>
          <p style={{ color: "#9CA3AF", margin: "0", fontSize: "12px" }}><strong>Order ID:</strong> {orderId}</p>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={dashboardUrl}
            style={{ display: "inline-block", backgroundColor: "#E50914", color: "#FFFFFF", fontWeight: "bold", textDecoration: "none", padding: "14px 28px", borderRadius: "8px", fontSize: "16px" }}
          >
            Go to Student Dashboard
          </a>
        </div>

        <p style={{ color: "#6B7280", fontSize: "12px", textAlign: "center", marginTop: "24px" }}>
          Your live class join links are available in your dashboard 15 minutes before class time.
        </p>
      </div>
    </div>
  );
}
