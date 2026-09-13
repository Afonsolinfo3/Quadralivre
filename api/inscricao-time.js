const { sendMail, isValidEmail, escapeHtml, isRateLimited, getIp, setCors } = require("./_lib/mailer");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Método não permitido." });

  if (isRateLimited(getIp(req))) {
    return res.status(429).json({ message: "Muitas tentativas. Tente novamente em alguns minutos." });
  }

  try {
    const { nomeTime, esporte, telefone, email, website } = req.body || {};

    // honeypot: campo invisível que só um robô preencheria
    if (website) return res.status(200).json({ ok: true });

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

    return res.status(200).json({ ok: true, message: "Inscrição enviada com sucesso." });
  } catch (err) {
    console.error("Erro ao enviar inscrição de time:", err);
    return res.status(500).json({ message: "Erro no servidor ao enviar a inscrição." });
  }
};
