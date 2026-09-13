// Helper compartilhado pelas funções serverless da Vercel (/api).
const nodemailer = require("nodemailer");

const TO_EMAIL = process.env.TO_EMAIL || "auticiusltdaa@gmail.com";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail({ subject, html, replyTo }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: `"Site Quadra Livre" <${process.env.SMTP_USER}>`,
    to: TO_EMAIL,
    replyTo: replyTo || undefined,
    subject,
    html,
  });
}

// Limite bem simples por IP, válido apenas enquanto a mesma instância
// serverless ficar "quente". Não substitui um rate-limit de verdade, mas
// já barra a maioria dos robôs. Em caso de abuso real, ative o Attack
// Challenge Mode / Firewall gratuito no painel da Vercel.
const hits = new Map();
function isRateLimited(ip, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const record = hits.get(ip) || { count: 0, start: now };
  if (now - record.start > windowMs) {
    record.count = 0;
    record.start = now;
  }
  record.count += 1;
  hits.set(ip, record);
  return record.count > max;
}

function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  return (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim() || "unknown";
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = { sendMail, isValidEmail, escapeHtml, isRateLimited, getIp, setCors };
