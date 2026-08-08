import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key");
export const EMAIL_FROM = process.env.EMAIL_FROM || "SELFFITS Academy <onboarding@resend.dev>";
