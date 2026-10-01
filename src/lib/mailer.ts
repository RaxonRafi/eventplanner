import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT || 465);

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!transporter) {
    console.warn("[mailer] SMTP not configured — skipping email to", to);
    return;
  }
  await transporter.sendMail({
    from: `"Eventers" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
}
