// ============================================================
// QUADRA LIVRE — front-end behaviour
// ============================================================

// If the API is hosted on a different domain/port than this page,
// set API_BASE to that full URL, e.g. "https://api.seudominio.com.br"
const API_BASE = "";

/* ---------------- mobile menu ---------------- */
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (navToggle && mobileMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    mobileMenu.hidden = !isOpen;
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenu.hidden = true;
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- lightbox gallery ---------------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".lightbox-trigger").forEach((fig) => {
  fig.style.cursor = "zoom-in";
  fig.addEventListener("click", () => {
    const full = fig.getAttribute("data-full");
    const alt = fig.querySelector("img")?.getAttribute("alt") || "";
    lightboxImg.src = full;
    lightboxImg.alt = alt;
    lightbox.classList.add("open");
  });
});

function closeLightbox() {
  lightbox.classList.remove("open");
  lightboxImg.src = "";
}
lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

/* ---------------- form helpers ---------------- */
function setStatus(el, message, ok) {
  el.textContent = message;
  el.classList.remove("ok", "err");
  el.classList.add("show", ok ? "ok" : "err");
}

function setLoading(button, loading) {
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "Enviando...";
  } else {
    button.disabled = false;
    if (button.dataset.originalText) button.innerHTML = button.dataset.originalText;
  }
}

async function sendForm(endpoint, payload) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Não foi possível enviar. Tente novamente.");
  }
  return data;
}

/* ---------------- Cadastro de time ---------------- */
const formTime = document.getElementById("formTime");
const statusTime = document.getElementById("statusTime");

formTime?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = formTime.querySelector("button[type=submit]");
  const data = {
    nomeTime: formTime.nomeTime.value.trim(),
    esporte: formTime.esporte.value,
    telefone: formTime.telefone.value.trim(),
    email: formTime.email.value.trim(),
    website: formTime.website.value, // honeypot anti-spam
  };

  if (!data.nomeTime || !data.esporte || !data.telefone || !data.email) {
    setStatus(statusTime, "Preencha todos os campos para inscrever seu time.", false);
    return;
  }

  setLoading(button, true);
  try {
    await sendForm("/api/inscricao-time", data);
    setStatus(statusTime, "Inscrição enviada! Em breve entraremos em contato para confirmar os detalhes.", true);
    formTime.reset();
  } catch (err) {
    setStatus(statusTime, err.message || "Erro ao enviar. Tente novamente em instantes.", false);
  } finally {
    setLoading(button, false);
  }
});

/* ---------------- Confirmação de presença ---------------- */
const formPresenca = document.getElementById("formPresenca");
const statusPresenca = document.getElementById("statusPresenca");

formPresenca?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = formPresenca.querySelector("button[type=submit]");
  const data = {
    nome: formPresenca.nome.value.trim(),
    email: formPresenca.email.value.trim(),
    website: formPresenca.website.value, // honeypot anti-spam
  };

  if (!data.nome) {
    setStatus(statusPresenca, "Informe seu nome completo para confirmar presença.", false);
    return;
  }

  setLoading(button, true);
  try {
    await sendForm("/api/confirmar-presenca", data);
    setStatus(statusPresenca, "Presença confirmada! Nos vemos em quadra.", true);
    formPresenca.reset();
  } catch (err) {
    setStatus(statusPresenca, err.message || "Erro ao enviar. Tente novamente em instantes.", false);
  } finally {
    setLoading(button, false);
  }
});
