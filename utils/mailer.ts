import nodemailer from 'nodemailer';

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function createTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Dev fallback: Ethereal
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'user@example.com',
        pass: process.env.ETHEREAL_PASS || 'password',
      },
    });
  }

  return cachedTransporter;
}

export async function sendMail(options: MailOptions) {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || 'no-reply@shankarmala.com';
  return transporter.sendMail({ from, ...options });
}


