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

const categories = document.querySelectorAll(".category");

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

// arummano o pdf da tela
function nudgeIframeOnce(iframe) {
    return new Promise(resolve => {
        const originalWidth = iframe.style.width || '100%';
        iframe.style.width = 'calc(100% - 1px)';
        requestAnimationFrame(() => {
            iframe.style.width = originalWidth;
            resolve();
        });
    });
}

async function nudgeIframeRepeated(iframe, tentativas = 8, baseDelay = 120) {
    for (let i = 0; i < tentativas; i++) {
        await nudgeIframeOnce(iframe);
        await new Promise(r => setTimeout(r, baseDelay * (i + 1)));
    }
}

/*abrir sidebars*/
function openRightSidebar(pdfUrl, livroId = null, isLoggedIn = false) {
    if (!isLoggedIn) {
        alert("Você precisa estar logado para ler este livro.");
        return;
    }

    const sidebar = document.getElementById("rightSidebar");
    sidebar.classList.add("expanded");

    const showDownload = pdfUrl && livroId && isLoggedIn;
        
    sidebar.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                ${showDownload ? `
                    <button onclick="baixarPdf('${pdfUrl}', '${livroId}')" style="background: none; border: none; cursor: pointer;">
                        <img src="img/DownloadEscuro.png" class="right-icon download-btn" alt="Download">
                    </button>
                    <button onclick="marcarComoLido('${livroId}')" style="background: none; border: none; cursor: pointer;">
                        <img src="img/EyeEscuro.png" class="right-icon visua-icon" alt="Marcar como lido">
                    </button>
                ` : ''}
            </div>
            <button onclick="closeRightSidebar()" style="border: none; background: none; cursor: pointer;">
                <img src="img/FecharEscuro.png" class="right-icon fechar-btn" alt="Fechar" draggable="false">
            </button>
        </div>

        ${pdfUrl ? `
            <div style="width: 100%; height: calc(100% - 50px);">
                <iframe id="pdf-viewer" data-livro-id="${livroId}" src="${pdfUrl}" style="width: 100%; height: 100%;" frameborder="0"></iframe>
            </div>` : `
            <p style="padding: 1rem;">Este livro não possui PDF disponível.</p>
        `}
    `;
    
    const iframe = document.getElementById("pdf-viewer");
if (iframe) {
    iframe.addEventListener('load', () => {
        // tenta várias vezes para acompanhar os resizes do Drive
        nudgeIframeRepeated(iframe);
    }, { once: true });
}

}

function baixarPdf(pdfUrl, livroId) {
    registrarDownload(livroId);

    const downloadUrl = corrigirLinkGoogleDrive(pdfUrl);

    if (downloadUrl.includes('drive.google.com')) {
        // se for link do google drive
        window.open(downloadUrl, '_blank');
    } else {
        // Se for PDF local:
        const link = document.createElement('a');
        link.href = `download.php?url=${encodeURIComponent(downloadUrl)}`;
        link.download = `livro_${livroId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function registrarDownload(livroId) {
    if (!isUserLoggedIn) {
        alert("Você precisa estar logado para baixar este livro.");
        return;
    }

    fetch('registrar_download.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livroId })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.sucesso) {
                alert("Erro: " + (data.erro || "Desconhecido"));
            }
        })
        .catch(err => console.error('Erro:', err));
}

function corrigirLinkGoogleDrive(url) {
    const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}

function marcarComoLido(livroId) {
    if (!isUserLoggedIn) {
        alert("Você precisa estar logado para marcar um livro como lido.");
        return;
    }

    fetch('marcar_lido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livroId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                location.reload(); // ou atualizar dinamicamente
            } else {
                alert("Erro ao marcar como lido: " + (data.erro || "Desconhecido"));
            }
        })
        .catch(err => console.error("Erro ao marcar como lido:", err));
}

function closeRightSidebar() {
    const sidebar = document.getElementById("rightSidebar");
    const iframe  = document.getElementById("pdf-viewer");

    if (iframe) {
        try {
            const livroId = iframe.getAttribute("data-livro-id");

            const scrollContainer =
                iframe.contentWindow.document.documentElement ||
                iframe.contentWindow.document.body;

            const scrollTop    = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const progresso    = scrollHeight
                                   ? scrollTop / scrollHeight   // evita 0 / 0
                                   : 0;

            /* debug*/
            console.log({ livroId, scrollTop, scrollHeight, progresso });
            /* ---------------------- */

            if (livroId && Number.isFinite(progresso) && progresso >= 0) {
                fetch('salvar_progresso.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ livroId, progresso })
                })
                .then(r => r.json())
                .then(d => console.log('salvar_progresso ⇒', d))
                .catch(err => console.warn('Erro ao salvar progresso:', err));
            }
        } catch (err) {
            console.warn("Não foi possível capturar o progresso:", err);
        }
    }

    sidebar.classList.remove("expanded");
    sidebar.innerHTML = "";
}

function toggleForm() {
    if (userForm && !userForm.classList.contains("hidden")) {
        userForm.classList.add("hidden");
    }
    if (logoutBubble && !logoutBubble.classList.contains("hidden")) {
        logoutBubble.classList.add("hidden");
    }
}


if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        const newTheme = isDarkMode ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    });
}


if (userBtn) {
    userBtn.addEventListener("click", () => {
        if (userForm) userForm.classList.toggle("hidden");
        if (logoutBubble && !logoutBubble.classList.contains("hidden")) {
            logoutBubble.classList.add("hidden");
        }
    });
}


if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (logoutBubble) logoutBubble.classList.toggle("hidden");
        if (userForm && !userForm.classList.contains("hidden")) {
            userForm.classList.add("hidden");
        }
    });
}


if (alternarFormularioBtn) {
    alternarFormularioBtn.addEventListener("click", () => {
        if (acaoInput.value === "cadastrar") {
            formTitle.textContent = "Entrar";
            acaoInput.value = "login";
            if (nomeField) nomeField.style.display = "none";
            if (nomeInput) nomeInput.removeAttribute("required");
            if (submitButton) submitButton.textContent = "Entrar";
            alternarFormularioBtn.textContent = "Não tem uma conta? Cadastre-se";
        } else {
            formTitle.textContent = "Cadastro";
            acaoInput.value = "cadastrar";
            if (nomeField) nomeField.style.display = "block";
            if (nomeInput) nomeInput.setAttribute("required", "required");
            if (submitButton) submitButton.textContent = "Cadastrar";
            alternarFormularioBtn.textContent = "Já tem uma conta? Entrar";
        }
    });
}

window.onload = function () {
    const successMessage = document.querySelector(".message.success");
    const errorMessage = document.querySelector(".message.error");

    if (successMessage) {
        setTimeout(() => {
            successMessage.style.opacity = "0";
            setTimeout(() => successMessage.style.display = "none", 500);
        }, 5000);
    }

    if (errorMessage) {
        setTimeout(() => {
            errorMessage.style.opacity = "0";
            setTimeout(() => errorMessage.style.display = "none", 500);
        }, 5000);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme("light");
    }

    toggleForm();

    if (nomeInput && acaoInput) {
        if (acaoInput.value === "cadastrar") {
            nomeInput.setAttribute("required", "required");
        } else {
            nomeInput.removeAttribute("required");
        }
    }
    
};


const bookList = document.querySelector('.book-list');

if (bookList) {
    let isDown = false;
    let startX;
    let scrollLeft;

    bookList.addEventListener('mousedown', (e) => {
        isDown = true;
        bookList.classList.add('active');
        startX = e.pageX - bookList.offsetLeft;
        scrollLeft = bookList.scrollLeft;
    });

    bookList.addEventListener('mouseleave', () => {
        isDown = false;
        bookList.classList.remove('active');
    });

    bookList.addEventListener('mouseup', () => {
        isDown = false;
        bookList.classList.remove('active');
    });

    bookList.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - bookList.offsetLeft;
        const walk = (x - startX) * 1.5;
        bookList.scrollLeft = scrollLeft - walk;
    });
}

// scroll butininho pras section
const scrollButtons = [
    { buttonClass: ".download-button", categoria: "download" },
    { buttonClass: ".saved-button", categoria: "salvos" },
    { buttonClass: ".visua-button", categoria: "lidos" },
    { buttonClass: ".info-button", seletor: ".footer" } // excecao
];

scrollButtons.forEach(({ buttonClass, categoria, seletor }) => {
    const botao = document.querySelector(buttonClass);

    if (botao) {
        botao.addEventListener("click", () => {
            let target;

            if (seletor) {
                // footer
                target = document.querySelector(seletor);
            } else if (categoria) {
                //data-category q corresponde
                target = document.querySelector(`.highlight[data-category="${categoria}"]`);
            }

            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("input[type='text']");
    const resultsContainer = document.querySelector(".search-results");
    const form = document.getElementById("auth-form");
    const userMessage = document.getElementById("userMessage");

    if (!searchInput || !resultsContainer) {
        console.error("Elemento de busca não encontrado!");
        return;
    }

    let livros = [];

    fetch("data/livros.json")
        .then(response => response.json())
        .then(data => {
            livros = data;
            carregarCapasCitacao(livros);
            iniciarTrocaDeCapas();

        })
        .catch(error => {
            console.error("Erro ao carregar livros.json:", error);
        });

    if (window.authMessage) {
    const box = document.getElementById("userMessage");
    if (box) {
        box.textContent = window.authMessage.text;
        box.classList.add("user-alert", window.authMessage.type);
        box.style.display = "block";

        // mostr ao forms
        const bubble = document.getElementById("userForm");
        if (bubble) bubble.classList.remove("hidden");

        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}


    // atualiza a bubsca
    function atualizarResultados(query) {
        resultsContainer.innerHTML = "";

        if (query.trim() === "") {
            resultsContainer.classList.add("hidden");
            return;
        }

        const filtrados = livros.filter(livro =>
            livro.nome.toLowerCase().includes(query.toLowerCase())
        );

        if (filtrados.length === 0) {
            const vazio = document.createElement("div");
            vazio.classList.add("result-item");
            vazio.textContent = "Nenhum livro encontrado";
            resultsContainer.appendChild(vazio);
        } else {
            filtrados.forEach(livro => {
                const item = document.createElement("div");
                item.classList.add("result-item");

                item.innerHTML = `
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${livro.capa}" alt="${livro.nome}" style="width: 40px; height: 60px; object-fit: cover; border: 1px solid #ccc;">
                    <div>
                      <strong>${livro.nome}</strong><br>
                      <small>${livro.autor}</small>
                    </div>
                  </div>
                `;

                item.addEventListener("click", () => {
                    searchInput.value = livro.nome;
                    resultsContainer.classList.add("hidden");

                    if (livro.link) {
                        openRightSidebar(livro.link, livro.id, typeof isUserLoggedIn !== 'undefined' ? isUserLoggedIn : false);
                    } else {
                        alert("Este livro não possui PDF disponível.");
                    }
                });

                resultsContainer.appendChild(item);
            });
        }

        resultsContainer.classList.remove("hidden");
    }

    // aparacer enquanto digita
    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        atualizarResultados(query);
    });

    // fecha se cluicar fora
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            resultsContainer.classList.add("hidden");
        }
    });
});


//categorias para mostrar só as que tem livros
document.querySelectorAll('.category').forEach(cat => {
    cat.addEventListener('click', () => {
        const categoriaSelecionada = cat.dataset.category;

        // remove atual e mostra outro
        document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
        cat.classList.add('active');

        // mostra/esconde as secoes
        document.querySelectorAll('.highlight[data-category]').forEach(section => {
            const listaLivros = section.querySelector('.book-list');

            if (categoriaSelecionada === "Todos") {
                section.style.display = "block";
                if (listaLivros) listaLivros.classList.remove("catalogo-grid"); // remove grid
            } else {
                if (section.dataset.category === categoriaSelecionada) {
                    section.style.display = "block";
                    if (listaLivros) listaLivros.classList.add("catalogo-grid"); // ativa grid
                } else {
                    section.style.display = "none";
                    if (listaLivros) listaLivros.classList.remove("catalogo-grid"); // limpa grid
                }
            }
        });
    });
});

// animacao scroll

const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-delay, .scroll-reveal-cascade');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

revealElements.forEach(el => observer.observe(el));

function applyDraggableScroll(bookListElement) {
    let isDown = false;
    let startX;
    let scrollLeft;

    bookListElement.addEventListener('mousedown', (e) => {
        isDown = true;
        bookListElement.classList.add('active');
        startX = e.pageX - bookListElement.offsetLeft;
        scrollLeft = bookListElement.scrollLeft;
    });

    bookListElement.addEventListener('mouseleave', () => {
        isDown = false;
        bookListElement.classList.remove('active');
    });

    bookListElement.addEventListener('mouseup', () => {
        isDown = false;
        bookListElement.classList.remove('active');
    });

    bookListElement.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - bookListElement.offsetLeft;
        const walk = (x - startX) * 1.5;
        bookListElement.scrollLeft = scrollLeft - walk;
    });
}

const allBookLists = document.querySelectorAll('.book-list');

allBookLists.forEach(applyDraggableScroll);

//salvar os livro
function salvarLivro(livroId, buttonElement) {
    fetch('salvar_livro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livroId })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.sucesso) {
                console.error("Erro ao salvar:", data.erro || "Desconhecido");
                return;
            }

            buttonElement.classList.toggle("salvo");

            const bookElement = buttonElement.closest(".book");
            const savedList = document.querySelector(".highlight-saved .book-list");

            if (!savedList || !bookElement) return;

            const existing = savedList.querySelector('#livro-' + livroId);

            if (buttonElement.classList.contains("salvo")) {
                // Adiciona na lista de salvos (se ainda n�o estiver)
                if (!existing) {
                    const clone = bookElement.cloneNode(true);

                    // Corrige onclick do bot�o no clone
                    const newBtn = clone.querySelector(".salvar-btn");
                    if (newBtn) {
                        newBtn.classList.add("salvo");
                        newBtn.onclick = (e) => {
                            e.stopPropagation();
                            salvarLivro(livroId, newBtn);
                        };
                    }

                    savedList.appendChild(clone);
                }
            } else {
                // Remove da lista de salvos
                if (existing) {
                    existing.remove();
                }
            }
        })
        .catch(err => console.error("Erro ao salvar livro:", err));
}

//livros gutenberg

function loadGutenbergBooks() {
    fetch('https://gutendex.com/books?languages=en&mime_type=text%2Fhtml&sort=popular')
        .then(response => response.json())
        .then(data => {
            const livros = data.results.slice(0, 20);
            const container = document.getElementById("gutenberg-list");

            livros.forEach(livro => {
                const titulo = livro.title;
                const autores = livro.authors.map(a => a.name).join(", ") || "Desconhecido";
                const capa = livro.formats["image/jpeg"] || "img/default.png";
                const link = livro.formats["text/html"] || livro.formats["application/pdf"] || livro.formats["text/plain"];

                if (!link) return;

                const div = document.createElement("div");
                div.classList.add("book");
                div.innerHTML = `
                    <img draggable="false" src="${capa}" alt="Capa de ${titulo}" width="120">
                    <div class="detalhes">
                        <h3>${titulo}</h3>
                        <p><strong>Autor:</strong> ${autores}</p>
                        <p><strong>Editora:</strong> Gutenberg</p>
                    </div>
                `;

                div.addEventListener("click", () => {
                    openRightSidebar(link, livro.id, typeof isUserLoggedIn !== "undefined" ? isUserLoggedIn : false);
                });

                container.appendChild(div);
            });
        })
        .catch(err => console.error("Erro ao carregar livros do Gutenberg:", err));
}

// chamada apis o DOM estar pronto
document.addEventListener("DOMContentLoaded", loadGutenbergBooks);

//capas aleatorias para citacoes

let livrosCitacao = [];

function carregarCapasCitacao(livros) {
    const embaralhados = [...livros].sort(() => Math.random() - 0.5).slice(0, 3);
    livrosCitacao = embaralhados; // guarda os livros usados

    embaralhados.forEach((livro, index) => {
        const img = document.getElementById(`citacaoLivro${index + 1}`);
        if (img) {
            img.src = livro.capa.replace("..", ".");
            img.alt = livro.nome;

            // armazena id e link como atributos personalizados
            img.setAttribute("data-id", livro.id);
            img.setAttribute("data-link", livro.link || "");
            img.style.cursor = "pointer";

            // adiciona evento de clique
            img.onclick = () => {
                const id = img.getAttribute("data-id");
                const link = img.getAttribute("data-link");

                if (!link) {
                    alert("Este livro não possui PDF disponível.");
                    return;
                }

                if (typeof isUserLoggedIn !== "undefined" && isUserLoggedIn) {
                    openRightSidebar(link, id, true);
                } else {
                    alert("Você precisa estar logado para ler este livro.");
                }
            };
        }
    });
}

let trocaInterval = null;

function iniciarTrocaDeCapas() {
    const capas = [
        document.getElementById("citacaoLivro1"),
        document.getElementById("citacaoLivro2"),
        document.getElementById("citacaoLivro3")
    ];

    if (capas.some(el => !el)) return;

    function trocar() {
        // troca os atributos visualmente
        const tempSrc = capas[0].src;
        const tempAlt = capas[0].alt;
        const tempId = capas[0].getAttribute("data-id");
        const tempLink = capas[0].getAttribute("data-link");

        for (let i = 0; i < 2; i++) {
            capas[i].src = capas[i + 1].src;
            capas[i].alt = capas[i + 1].alt;
            capas[i].setAttribute("data-id", capas[i + 1].getAttribute("data-id"));
            capas[i].setAttribute("data-link", capas[i + 1].getAttribute("data-link"));
        }

        capas[2].src = tempSrc;
        capas[2].alt = tempAlt;
        capas[2].setAttribute("data-id", tempId);
        capas[2].setAttribute("data-link", tempLink);

        // anima��o fade
        capas.forEach(capa => {
            capa.classList.remove("fade");
            void capa.offsetWidth;
            capa.classList.add("fade");
        });
    }

    trocaInterval = setInterval(trocar, 3000);

    capas.forEach(capa => {
        const livroDiv = capa.closest(".livro");

        livroDiv.addEventListener("mouseenter", () => {
            clearInterval(trocaInterval);
        });

        livroDiv.addEventListener("mouseleave", () => {
            trocaInterval = setInterval(trocar, 3000);
        });

        livroDiv.addEventListener("mousemove", e => {
            const rect = livroDiv.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            livroDiv.style.setProperty("--mouse-x", `${x}px`);
            livroDiv.style.setProperty("--mouse-y", `${y}px`);
        });
    });
}

const logoBtn = document.querySelector(".toggle-btnL");

if (logoBtn) {
    logoBtn.addEventListener("click", () => {
        const sidebar = document.getElementById("rightSidebar");

        if (sidebar && sidebar.classList.contains("expanded")) {
            closeRightSidebar(); // s� fecha a sidebar se estiver aberta
        } else {
            location.reload(); // sen�o, recarrega a p�gina
        }
    });

    // 1. Fechar sidebar ao clicar fora
document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("rightSidebar");

    if (
        sidebar &&
        sidebar.classList.contains("expanded") &&
        !sidebar.contains(e.target) &&
        !e.target.closest(".book") &&
        !e.target.closest(".livro") &&
        !e.target.closest(".search-results") &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".category")
    ) {
        closeRightSidebar();
    }
});

// 2. Reabrir a sidebar mostrando o �ltimo livro lido
const rightSidebar = document.getElementById("rightSidebar");

if (rightSidebar) {
    rightSidebar.addEventListener("click", () => {
        if (!rightSidebar.classList.contains("expanded")) {
            fetch("recuperar_progresso.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ buscarUltimo: true })
            })
            .then(res => res.json())
            .then(data => {
                const ultimoId = data.ultimo_livro_id;
                if (!ultimoId) return;

                fetch("data/livros.json")
                    .then(res => res.json())
                    .then(livros => {
                        const livro = livros.find(l => l.id === ultimoId);
                        if (livro && livro.link) {
                            openRightSidebar(livro.link, livro.id, typeof isUserLoggedIn !== "undefined" ? isUserLoggedIn : false);
                        }
                    });
            })
            .catch(err => console.error("Erro ao abrir o último livro:", err));
        }
    });
}

}
