# Site — Campeonato Quadra Livre

Site institucional do Campeonato Quadra Livre (realização Auticius, em parceria
com a Igreja Universal do Reino de Deus), com formulário de inscrição de times
e confirmação de presença, que envia os dados por e-mail.

## Estrutura

```
quadra-livre-site/
├── index.html            → página única do site
├── css/style.css          → todo o visual
├── js/main.js             → menu mobile, galeria e envio dos formulários
├── img/                   → ilustrações do site (SVG, substituíveis por fotos reais)
├── api/                   → funções serverless da Vercel (envio de e-mail)
│   ├── inscricao-time.js
│   ├── confirmar-presenca.js
│   └── _lib/mailer.js
├── package.json           → dependência (nodemailer) usada pelas funções /api
├── server/                → back-end alternativo em Express, para quando
│                             você tiver uma VPS (não é usado na Vercel)
└── README.md
```

Hospedando na **Vercel**, você não precisa da pasta `server/` — as pastas
`index.html`, `css/`, `js/`, `img/` e `api/` são tudo o que a Vercel precisa.
A pasta `server/` fica pronta para o dia em que você migrar para uma VPS.

## 1. Publicar na Vercel (grátis)

### Opção A — pelo site da Vercel (sem usar terminal)

1. Crie uma conta em [vercel.com](https://vercel.com) (dá pra usar login do GitHub, GitLab ou e-mail).
2. Se ainda não tiver, crie um repositório (no GitHub, por exemplo) e suba
   a pasta `quadra-livre-site` inteira nele.
3. Na Vercel, clique em **Add New → Project**, selecione esse repositório e
   clique em **Deploy**. Como não há framework, a Vercel detecta
   automaticamente os arquivos estáticos e a pasta `api/`.
4. Antes ou depois do primeiro deploy, vá em **Settings → Environment
   Variables** do projeto e cadastre (veja o passo 2 abaixo para a senha):
   - `TO_EMAIL` = `auticiusltdaa@gmail.com`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `auticiusltdaa@gmail.com`
   - `SMTP_PASS` = *(a senha de app do Gmail — passo 2)*
5. Clique em **Redeploy** para as variáveis passarem a valer.
6. Pronto — a Vercel te dá uma URL tipo `quadra-livre.vercel.app`.

### Opção B — pelo terminal (Vercel CLI)

```bash
npm install -g vercel
cd quadra-livre-site
vercel login
vercel          # primeiro deploy (ambiente de preview)
vercel env add TO_EMAIL
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel --prod   # publica em produção
```

### Depois: usar seu domínio próprio na Vercel

Quando quiser usar `auticiusltda.com.br` em vez do endereço `.vercel.app`:
1. No projeto, vá em **Settings → Domains** e adicione seu domínio.
2. A Vercel mostra um ou dois registros DNS (tipo `A` ou `CNAME`) para você
   cadastrar no painel onde comprou o domínio.
3. Depois de propagar (minutos a poucas horas), o site já responde no seu
   domínio, com HTTPS automático — não precisa configurar certificado.

Isso funciona mesmo sem VPS: a Vercel hospeda tudo (site + as funções que
enviam e-mail).

## 2. Configurar o envio de e-mail (Gmail, mais simples)

O e-mail `auticiusltdaa@gmail.com` recebe as inscrições. Para permitir que as
funções da Vercel enviem e-mails por ele:

1. Entre em `auticiusltdaa@gmail.com` e ative a verificação em duas etapas:
   `https://myaccount.google.com/security`
2. Crie uma senha de app em `https://myaccount.google.com/apppasswords`
   (escolha "Outro (nome personalizado)" → "Quadra Livre Site").
3. Copie a senha gerada (16 letras) — é ela que vai na variável `SMTP_PASS`
   na Vercel (passo 1, item 4 acima).

Cada inscrição de time ou confirmação de presença chega como um e-mail
separado nessa caixa, com todos os dados preenchidos no formulário.

## 3. Testar localmente antes de publicar (opcional)

Precisa do [Node.js](https://nodejs.org) 18+ e da Vercel CLI.

```bash
npm install -g vercel
cd quadra-livre-site
cp .env.example .env.local   # preencha com a senha de app do Gmail
vercel dev
```

Isso sobe o site e as funções `/api/*` juntos em `http://localhost:3000`,
exatamente como vai rodar em produção — não precisa mexer no `API_BASE` do
`js/main.js` (ele já é `""`, ou seja, mesmo domínio).

## 4. Trocar as fotos (recomendado antes de divulgar)

As imagens em `img/` são ilustrações vetoriais no estilo da identidade visual
(verde escuro + verde-limão), criadas como espaço reservado, já que eu não
tinha acesso às fotos reais da quadra. Para usar fotos de verdade:

1. Coloque suas fotos (`.jpg`/`.png`) dentro de `img/` — por exemplo `quadra-1.jpg`.
2. No `index.html`, troque cada `src="img/....svg"` pelo caminho da sua foto.
3. Pode apagar os `.svg` depois de trocar todos os usos.

## 5. Ajustar data, local e textos

Todos os textos (data do evento, horário, endereço, e-mails, nome dos
parceiros) estão diretamente no `index.html` — não há CMS. Procure e edite:

- Data/horário/local: seção `<dl class="hero-facts">` no topo do arquivo.
  **Atenção:** coloquei 15 de novembro de 2026 como data provisória — confirme
  a data real do evento.
- Textos "sobre o evento" e "sobre o app": seções `#sobre` e a seguinte.
- Nome dos parceiros: seção `id="parceria"`.
- E-mail de contato exibido no rodapé: seção `<footer>`.

## 6. Migrar para uma VPS no futuro

Quando tiver a VPS, use a pasta `server/` (Express + Nodemailer) em vez das
funções `api/` — o front-end (`index.html`, `css/`, `js/`) não muda nada
nessa migração, só o endereço das chamadas de API.

Resumo dos passos (na VPS, com o domínio já apontando para o IP):

```bash
sudo apt update && sudo apt install -y nginx nodejs npm
sudo npm install -g pm2

# envie a pasta quadra-livre-site inteira para /var/www/quadra-livre

cd /var/www/quadra-livre/server
cp .env.example .env        # preencha SMTP_PASS e ALLOWED_ORIGIN
npm install
pm2 start server.js --name quadra-livre-api
pm2 save && pm2 startup
```

Configure o Nginx para servir os arquivos estáticos na raiz do domínio e
fazer proxy de `/api/` para `http://localhost:3001` (a porta do `server.js`),
depois ative HTTPS com `sudo certbot --nginx -d seudominio.com.br`. Nesse
cenário, mantenha `API_BASE = ""` em `js/main.js`, já que front e back ficam
no mesmo domínio.

## 7. Checklist antes de divulgar o link

- [ ] Data, horário e endereço do evento conferidos no hero.
- [ ] Fotos reais da quadra substituindo as ilustrações (opcional, mas recomendado).
- [ ] Variáveis de ambiente cadastradas na Vercel e projeto redeploy feito.
- [ ] Testou o envio dos dois formulários e recebeu o e-mail em
      `auticiusltdaa@gmail.com`.
- [ ] Testado em um celular (o menu, os formulários e a galeria).
