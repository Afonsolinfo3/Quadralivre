// ============================================================
// QUADRA LIVRE — servidor de inscrições
// Recebe os dois formulários do site e envia por e-mail.
// ============================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;
const TO_EMAIL = process.env.TO_EMAIL || "auticiusltdaa@gmail.com";

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*", // troque pelo domínio final em produção
  })
);

// Limita tentativas para evitar spam/abuso nos formulários
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { message: "Muitas tentativas. Tente novamente em alguns minutos." },
});
app.use("/api/", formLimiter);

// Transporte SMTP — configurado via variáveis de ambiente (ver .env.example)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendMail({ subject, html, replyTo }) {
  return transporter.sendMail({
    from: `"Site Quadra Livre" <${process.env.SMTP_USER}>`,
    to: TO_EMAIL,
    replyTo: replyTo || undefined,
    subject,
    html,
  });
}

// -------- Inscrição de time --------
app.post("/api/inscricao-time", async (req, res) => {
  try {
    const { nomeTime, esporte, telefone, email } = req.body || {};

    if (!nomeTime || !esporte || !telefone || !email) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Informe um e-mail válido." });
    }

    await sendMail({
      subject: `Nova inscrição de time — ${nomeTime}`,
      replyTo: email,
      html: `
        <h2>Nova inscrição de time — Campeonato Quadra Livre</h2>
        <p><strong>Nome do time:</strong> ${escapeHtml(nomeTime)}</p>
        <p><strong>Esporte:</strong> ${escapeHtml(esporte)}</p>
        <p><strong>Telefone de contato:</strong> ${escapeHtml(telefone)}</p>
        <p><strong>E-mail de contato:</strong> ${escapeHtml(email)}</p>
      `,
    });

    res.json({ ok: true, message: "Inscrição enviada com sucesso." });
  } catch (err) {
    console.error("Erro ao enviar inscrição de time:", err);
    res.status(500).json({ message: "Erro no servidor ao enviar a inscrição." });
  }
});

// -------- Confirmação de presença --------
app.post("/api/confirmar-presenca", async (req, res) => {
  try {
    const { nome, email } = req.body || {};

    if (!nome) {
      return res.status(400).json({ message: "Informe seu nome completo." });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Informe um e-mail válido ou deixe em branco." });
    }

    await sendMail({
      subject: `Confirmação de presença — ${nome}`,
      replyTo: email || undefined,
      html: `
        <h2>Nova confirmação de presença — Campeonato Quadra Livre</h2>
        <p><strong>Nome completo:</strong> ${escapeHtml(nome)}</p>
        <p><strong>E-mail:</strong> ${email ? escapeHtml(email) : "não informado"}</p>
      `,
    });

    res.json({ ok: true, message: "Presença confirmada com sucesso." });
  } catch (err) {
    console.error("Erro ao enviar confirmação de presença:", err);
    res.status(500).json({ message: "Erro no servidor ao confirmar presença." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

app.listen(PORT, () => {
  console.log(`Servidor de inscrições rodando na porta ${PORT}`);
});
