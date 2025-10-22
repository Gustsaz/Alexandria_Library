/* ================================================
   CONFIGURAÇÕES INICIAIS
================================================= */
const toggleBtnL = document.querySelector(".toggle-btnL");
const Logo = document.querySelector(".logo-sidebar");
const Info = document.getElementById("info-icon");
const Down = document.getElementById("download-icon");
const Visu = document.getElementById("visua-icon");
const Salvo = document.getElementById("saved-icon");
const Conta = document.getElementById("conta-icon");
const rightDownload = document.querySelector(".download-btn");
const rightFechar = document.querySelector(".fechar-btn");
const rightLido = document.querySelector(".visua-icon");
const toggleThemeBtn = document.querySelector(".mode-toggle");
const themeIcon = document.getElementById("theme-icon");

/* ================================================
   MODO CLARO/ESCURO
================================================= */
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.src = "img/Claro.png";
    if (Logo) Logo.src = "img/LogoClaro.png";
    if (Info) Info.src = "img/InfoClaro.png";
    if (Down) Down.src = "img/DownloadClaro.png";
    if (Salvo) Salvo.src = "img/SavedClaro.png";
    if (Conta) Conta.src = "img/ContaClaro.png";
    if (rightDownload) rightDownload.src = "img/DownloadClaro.png";
    if (rightLido) rightLido.src = "img/EyeClaro.png";
    if (rightFechar) rightFechar.src = "img/FecharClaro.png";
  } else {
    document.body.classList.remove("dark-mode");
    if (themeIcon) themeIcon.src = "img/Escuro.png";
    if (Logo) Logo.src = "img/LogoEscuro.png";
    if (Info) Info.src = "img/InfoEscuro.png";
    if (Down) Down.src = "img/DownloadEscuro.png";
    if (Salvo) Salvo.src = "img/SavedEscuro.png";
    if (Conta) Conta.src = "img/ContaEscuro.png";
    if (rightDownload) rightDownload.src = "img/DownloadEscuro.png";
    if (rightLido) rightLido.src = "img/EyeEscuro.png";
    if (rightFechar) rightFechar.src = "img/FecharEscuro.png";
  }
}

if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    const theme = isDark ? "dark" : "light";
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  });
}

/* ================================================
   LOGIN / CADASTRO
================================================= */
const userBtn = document.getElementById("userBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userForm = document.getElementById("userForm");
const logoutBubble = document.getElementById("logoutBubble");
const alternarFormularioBtn = document.getElementById("alternarFormularioBtn");
const formTitle = document.getElementById("form-title");
const acaoInput = document.getElementById("acao");
const nomeField = document.getElementById("nome-field");
const submitButton = document.getElementById("submit-button");
const nomeInput = document.querySelector("#nome-field input[name='nome']");

function toggleForm() {
  if (userForm && !userForm.classList.contains("hidden")) {
    userForm.classList.add("hidden");
  }
  if (logoutBubble && !logoutBubble.classList.contains("hidden")) {
    logoutBubble.classList.add("hidden");
  }
}

if (userBtn) {
  userBtn.addEventListener("click", () => {
    userForm?.classList.toggle("hidden");
    logoutBubble?.classList.add("hidden");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logoutBubble?.classList.toggle("hidden");
    userForm?.classList.add("hidden");
  });
}

if (alternarFormularioBtn) {
  alternarFormularioBtn.addEventListener("click", () => {
    if (acaoInput.value === "cadastrar") {
      formTitle.textContent = "Entrar";
      acaoInput.value = "login";
      nomeField.style.display = "none";
      nomeInput.removeAttribute("required");
      submitButton.textContent = "Entrar";
      alternarFormularioBtn.textContent = "Não tem uma conta? Cadastre-se";
    } else {
      formTitle.textContent = "Cadastro";
      acaoInput.value = "cadastrar";
      nomeField.style.display = "block";
      nomeInput.setAttribute("required", "required");
      submitButton.textContent = "Cadastrar";
      alternarFormularioBtn.textContent = "Já tem uma conta? Entrar";
    }
  });
}

/* ================================================
   ABRIR E FECHAR SIDEBAR DO PDF
================================================= */
function nudgeIframeOnce(iframe) {
  return new Promise((resolve) => {
    const originalWidth = iframe.style.width || "100%";
    iframe.style.width = "calc(100% - 1px)";
    requestAnimationFrame(() => {
      iframe.style.width = originalWidth;
      resolve();
    });
  });
}
async function nudgeIframeRepeated(iframe, tentativas = 8, baseDelay = 120) {
  for (let i = 0; i < tentativas; i++) {
    await nudgeIframeOnce(iframe);
    await new Promise((r) => setTimeout(r, baseDelay * (i + 1)));
  }
}

function openRightSidebar(pdfUrl, livroId = null, isLoggedIn = false) {
  if (!isLoggedIn) {
    alert("Você precisa estar logado para ler este livro.");
    return;
  }

  const sidebar = document.getElementById("rightSidebar");
  sidebar.classList.add("expanded");

  const showDownload = pdfUrl && livroId && isLoggedIn;
  sidebar.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;">
      <div style="display:flex;gap:10px;align-items:center;">
        ${showDownload ? `
          <button onclick="baixarPdf('${pdfUrl}', '${livroId}')" style="background:none;border:none;cursor:pointer;">
            <img src="img/DownloadEscuro.png" class="right-icon download-btn" alt="Download">
          </button>
          <button onclick="marcarComoLido('${livroId}')" style="background:none;border:none;cursor:pointer;">
            <img src="img/EyeEscuro.png" class="right-icon visua-icon" alt="Lido">
          </button>` : ""}
      </div>
      <button onclick="closeRightSidebar()" style="border:none;background:none;cursor:pointer;">
        <img src="img/FecharEscuro.png" class="right-icon fechar-btn" alt="Fechar" draggable="false">
      </button>
    </div>
    ${pdfUrl ? `<iframe id="pdf-viewer" data-livro-id="${livroId}" src="${pdfUrl}" style="width:100%;height:calc(100% - 50px);" frameborder="0"></iframe>` : `<p style="padding:1rem;">Este livro não possui PDF disponível.</p>`}
  `;
  const iframe = document.getElementById("pdf-viewer");
  if (iframe) {
    iframe.addEventListener("load", () => nudgeIframeRepeated(iframe), { once: true });
  }
}

function closeRightSidebar() {
  const sidebar = document.getElementById("rightSidebar");
  sidebar.classList.remove("expanded");
  sidebar.innerHTML = "";
}

/* ================================================
   DOWNLOAD / SALVAR / LIDO
================================================= */
function corrigirLinkGoogleDrive(url) {
  const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

function registrarDownload(livroId) {
  if (!window.isUserLoggedIn) {
    alert("Você precisa estar logado para baixar este livro.");
    return;
  }
  fetch("registrar_download.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livroId }),
  }).catch((err) => console.error("Erro download:", err));
}

function baixarPdf(pdfUrl, livroId) {
  registrarDownload(livroId);
  const linkCorrigido = corrigirLinkGoogleDrive(pdfUrl);
  if (linkCorrigido.includes("drive.google.com")) {
    window.open(linkCorrigido, "_blank");
  } else {
    const link = document.createElement("a");
    link.href = `download.php?url=${encodeURIComponent(linkCorrigido)}`;
    link.download = `livro_${livroId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function marcarComoLido(livroId) {
  if (!window.isUserLoggedIn) {
    alert("Você precisa estar logado para marcar como lido.");
    return;
  }
  fetch("marcar_lido.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livroId }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.sucesso) alert("Erro: " + (data.erro || "Desconhecido"));
    })
    .catch(console.error);
}

function salvarLivro(livroId, buttonElement) {
  fetch("salvar_livro.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livroId }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.sucesso) return alert("Erro ao salvar livro.");
      buttonElement.classList.toggle("salvo");
    })
    .catch(console.error);
}

/* ================================================
   CARREGAR LIVROS LOCAIS (data/livros.json)
================================================= */
async function loadLocalBooks() {
  try {
    const res = await fetch("data/livros.json");
    const livros = await res.json();
    window.appLivros = livros;

    const listaTodos = document.getElementById("lista-todos");
    const frag = document.createDocumentFragment();

    livros.forEach((livro) => {
      const div = document.createElement("div");
      div.className = "book";
      div.id = "livro-" + livro.id;
      div.innerHTML = `
        <img draggable="false" src="${livro.capa}" alt="${livro.nome}">
        <div class="detalhes">
          <h3>${livro.nome}</h3>
          <p><strong>Autor:</strong> ${livro.autor}</p>
          <p><strong>Editora:</strong> ${livro.editora}</p>
        </div>
      `;
      div.addEventListener("click", () =>
        openRightSidebar(livro.link, livro.id, window.isUserLoggedIn)
      );
      frag.appendChild(div);
    });

    listaTodos.innerHTML = "";
    listaTodos.appendChild(frag);
  } catch (err) {
    console.error("Erro ao carregar livros locais:", err);
  }
}

/* ================================================
   LIVROS DO GUTENBERG
================================================= */
function loadGutenbergBooks() {
  fetch("https://gutendex.com/books?languages=en&mime_type=text%2Fhtml&sort=popular")
    .then((r) => r.json())
    .then((data) => {
      const livros = data.results.slice(0, 20);
      const container = document.getElementById("gutenberg-list");
      livros.forEach((livro) => {
        const titulo = livro.title;
        const autores = livro.authors.map((a) => a.name).join(", ") || "Desconhecido";
        const capa = livro.formats["image/jpeg"] || "img/default.png";
        const link =
          livro.formats["text/html"] ||
          livro.formats["application/pdf"] ||
          livro.formats["text/plain"];
        if (!link) return;
        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `
          <img draggable="false" src="${capa}" alt="${titulo}">
          <div class="detalhes">
            <h3>${titulo}</h3>
            <p><strong>Autor:</strong> ${autores}</p>
            <p><strong>Editora:</strong> Gutenberg</p>
          </div>`;
        div.addEventListener("click", () =>
          openRightSidebar(link, livro.id, window.isUserLoggedIn)
        );
        container.appendChild(div);
      });
    })
    .catch(console.error);
}

/* ================================================
   CAPAS DA CITAÇÃO
================================================= */
function carregarCapasCitacao(livros) {
  const aleatorios = [...livros].sort(() => Math.random() - 0.5).slice(0, 3);
  aleatorios.forEach((livro, i) => {
    const img = document.getElementById(`citacaoLivro${i + 1}`);
    if (img) {
      img.src = livro.capa;
      img.alt = livro.nome;
      img.onclick = () => {
        if (window.isUserLoggedIn) {
          openRightSidebar(livro.link, livro.id, true);
        } else {
          alert("Você precisa estar logado para ler este livro.");
        }
      };
    }
  });
}

/* ================================================
   EVENTOS DOM / INICIALIZAÇÃO
================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  toggleForm();
  loadLocalBooks();
  loadGutenbergBooks();
});
