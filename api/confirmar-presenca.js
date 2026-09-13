const { sendMail, isValidEmail, escapeHtml, isRateLimited, getIp, setCors } = require("./_lib/mailer");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Método não permitido." });

  if (isRateLimited(getIp(req))) {
    return res.status(429).json({ message: "Muitas tentativas. Tente novamente em alguns minutos." });
  }

  try {
    const { nome, email, website } = req.body || {};

    // honeypot: campo invisível que só um robô preencheria
    if (website) return res.status(200).json({ ok: true });

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

    return res.status(200).json({ ok: true, message: "Presença confirmada com sucesso." });
  } catch (err) {
    console.error("Erro ao enviar confirmação de presença:", err);
    return res.status(500).json({ message: "Erro no servidor ao confirmar presença." });
  }
};
