// Alexandria Library - Firebase Integrated.js
// Global variables
let currentUser = null;
let allBooks = [];
let userData = { savedBooks: [], downloadedBooks: [], readBooks: [] };

const toggleBtnL = document.querySelector(".toggle-btnL");
const Logo = document.querySelector(".logo-sidebar");
const Info = document.getElementById("info-icon");
const Down = document.getElementById("download-icon") || { src: '' };
const Visu = document.getElementById("visua-icon") || { src: '' };
const Salvo = document.getElementById("saved-icon") || { src: '' };
const Conta = document.getElementById("conta-icon") || { src: '' };
const rightDownload = document.querySelector(".download-btn") || {};
const rightFechar = document.querySelector(".fechar-btn") || {};
const rightLido = document.querySelector(".visua-icon") || {};

// Firebase utilities
const auth = window.firebaseAuth;
const db = window.firebaseDb;
const provider = window.firebaseProvider;
const signInWithPopup = window.firebaseSignInWithPopup;
const signOut = window.firebaseSignOut;
const onAuthStateChanged = window.firebaseOnAuthStateChanged;
const getDocs = window.firebaseGetDocs;
const collection = window.firebaseCollection;
const doc = window.firebaseDoc;
const getDoc = window.firebaseGetDoc;
const updateDoc = window.firebaseUpdateDoc;
const setDoc = window.firebaseSetDoc;
const query = window.firebaseQuery;
const where = window.firebaseWhere;

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

// Load books from Firestore
async function loadBooks() {
    try {
        const querySnapshot = await firebaseGetDocs(firebaseCollection(firebaseDb, 'livros'));
        allBooks = [];
        querySnapshot.forEach(doc_snap => {
            allBooks.push({ id: doc_snap.id, ...doc_snap.data() });
        });

        populateBooks(allBooks);
        populateCategories(allBooks);
        carregarCapasCitacao(allBooks);
        iniciarTrocaDeCapas();
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Populate book lists
function populateBooks(books) {
    const categoryMappings = {
        Todos: 'todos-list',
        Aventura: 'aventura-list',
        Fantasia: 'fantasia-list',
        Romance: 'romance-list',
        suspense: 'suspense-list', // Match data-category, but function checks 'Suspense' vs 'suspense'
        Scifi: 'scifi-list',
        Terror: 'terror-list',
        Quadrinho: 'quadrinho-list'
    };

    // Clear existing
    Object.values(categoryMappings).forEach(listId => {
        const list = document.getElementById(listId);
        if (list) list.innerHTML = '';
    });

    // Populate
    books.forEach(livro => {
        const categoria = livro.categoria || 'Todos';
        const listId = categoryMappings[categoria] || categoryMappings.Todos;
        const list = document.getElementById(listId);
        if (list) {
            const bookDiv = createBookElement(livro);
            list.appendChild(bookDiv);
        }
    });
}

// Create book element
function createBookElement(livro) {
    const div = document.createElement('div');
    div.classList.add('book');
    div.id = `livro-${livro.id}`;
    div.onclick = () => openRightSidebar(livro.link, livro.id, !!currentUser);

    const isSaved = userData.savedBooks.includes(livro.id);

    div.innerHTML = `
        <img draggable="false" src="${livro.capa}" alt="Capa do livro ${livro.nome}">
        <div class="detalhes">
            <h3>${livro.nome}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Editora:</strong> ${livro.editora}</p>
        </div>
        ${currentUser ? `
            <button class="salvar-btn ${isSaved ? 'salvo' : ''}" onclick="event.stopPropagation(); salvarLivro('${livro.id}', this)">
                <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
            </button>
        ` : ''}
    `;

    return div;
}

// Populate categories nav
function populateCategories(books) {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;

    const categoryCount = {};
    books.forEach(livro => {
        const cat = livro.categoria || 'Todos';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Include hardcoded counts or calculate
    const categories = [
        { name: 'Todos', count: books.length },
        { name: 'Aventura', count: categoryCount.Aventura || 0 },
        { name: 'Fantasia', count: categoryCount.Fantasia || 0 },
        { name: 'Romance', count: categoryCount.Romance || 0 },
        { name: 'Scifi', count: categoryCount.Scifi || 0 },
        { name: 'Suspense', count: categoryCount.Suspense || 0 },
        { name: 'Terror', count: categoryCount.terror || 0 },
        { name: 'Quadrinho', count: categoryCount.Quadrinho || 0 },
        { name: 'Gutenberg', count: 20 } // Fixed
    ];

    // Map category names to image filenames
    const iconMap = {
        'Todos': 'todos.png',
        'Aventura': 'aventura.png',
        'Fantasia': 'fantasia.png',
        'Romance': 'romance.png',
        'Scifi': 'ficcao.png',
        'Suspense': 'suspense.png',
        'Terror': 'horror.png',
        'Quadrinho': 'quadrinho.png',
        'Gutenberg': 'gutenberg.png'
    };

    categoriesContainer.innerHTML = categories.map(cat => {
        const iconName = iconMap[cat.name] || 'todos.png';
        return `
        <button class="category ${cat.name === 'Todos' ? 'active' : ''} scroll-reveal-cascade delay-1" data-category="${cat.name}" style="background: #f0f0f0 !important; color: #333 !important; border: 2px solid #ddd !important; padding: 10px !important; margin: 5px !important; display: inline-flex !important; align-items: center !important; gap: 8px !important; cursor: pointer !important; border-radius: 5px !important; font-size: 14px !important; opacity: 1 !important; visibility: visible !important; z-index: 100 !important; position: relative !important;">
            <img draggable="false" src="img/icons/${iconName}" alt="${cat.name}" style="width: 24px; height: 24px;">
            ${cat.name} (${cat.count})
        </button>`;
    }).join('');

    // Re-attach event listeners for categories
    document.querySelectorAll('.category').forEach(cat => {
        cat.addEventListener('click', () => {
            const categoriaSelecionada = cat.dataset.category;
            document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
            cat.classList.add('active');

            document.querySelectorAll('.highlight[data-category]').forEach(section => {
                section.style.display = categoriaSelecionada === "Todos" || section.dataset.category.includes(categoriaSelecionada) ? "block" : "none";
            });

            // Ensure Gutenberg books are loaded when category is selected
            if (categoriaSelecionada === "Gutenberg") {
                loadGutenbergBooks();
            }
        });
    });
}

function baixarPdf(pdfUrl, livroId) {
    if (!currentUser) {
        alert("Você precisa estar logado para baixar este livro.");
        return;
    }

    registrarDownload(livroId);

    const downloadUrl = corrigirLinkGoogleDrive(pdfUrl);

    if (downloadUrl.includes('drive.google.com')) {
        window.open(downloadUrl, '_blank');
    } else {
        // Assume direct PDF link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `livro_${livroId}.pdf`;
        link.target = '_blank';
        link.click();
    }
}

function registrarDownload(livroId) {
    if (!currentUser) {
        alert("Você precisa estar logado para baixar este livro.");
        return;
    }

    if (!userData.downloadedBooks.includes(livroId)) {
        userData.downloadedBooks.push(livroId);
        saveUserData();
    }
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
    if (!currentUser) {
        alert("Você precisa estar logado para marcar um livro como lido.");
        return;
    }

    if (!userData.readBooks.includes(livroId)) {
        userData.readBooks.push(livroId);
        saveUserData();
    }
}

// Populate user lists
function populateUserLists() {
    // Clear existing
    document.getElementById('download-list').innerHTML = '';
    document.getElementById('salvos-list').innerHTML = '';
    document.getElementById('lidos-list').innerHTML = '';

    // Populate downloaded
    userData.downloadedBooks.forEach(id => {
        const livro = allBooks.find(l => l.id === id);
        if (livro) {
            const div = createBookElement(livro);
            document.getElementById('download-list').appendChild(div);
        }
    });

    // Populate saved
    userData.savedBooks.forEach(id => {
        const livro = allBooks.find(l => l.id === id);
        if (livro) {
            const div = createBookElement(livro);
            document.getElementById('salvos-list').appendChild(div);
        }
    });

    // Populate read
    userData.readBooks.forEach(id => {
        const livro = allBooks.find(l => l.id === id);
        if (livro) {
            const div = createBookElement(livro);
            document.getElementById('lidos-list').appendChild(div);
        }
    });
}

function closeRightSidebar() {
    const sidebar = document.getElementById("rightSidebar");
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

// Firebase utilities will be set by index.html
let firebaseAuth, firebaseDb, firebaseProvider, firebaseSignInWithPopup, firebaseSignOut, firebaseOnAuthStateChanged, firebaseGetDocs, firebaseCollection, firebaseDoc, firebaseGetDoc, firebaseUpdateDoc, firebaseSetDoc;

// Wait for Firebase to load, then set up all Firebase-dependent functions
document.addEventListener('firebase-loaded', () => {
    // Set Firebase instances
    const auth = window.firebaseAuth;
    const db = window.firebaseDb;
    const provider = window.firebaseProvider;
    const signInWithPopup = window.firebaseSignInWithPopup;
    const signOut = window.firebaseSignOut;
    const onAuthStateChanged = window.firebaseOnAuthStateChanged;
    const getDocs = window.firebaseGetDocs;
    const collection = window.firebaseCollection;
    const doc = window.firebaseDoc;
    const getDoc = window.firebaseGetDoc;
    const updateDoc = window.firebaseUpdateDoc;
    const setDoc = window.firebaseSetDoc;

    // Override global functions to work after Firebase loads
    window.googleSignIn = async function () {
        try {
            const result = await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in:', error);
            showMessage('Erro ao fazer login', 'error');
        }
    };

    window.loadBooks = async function () {
        try {
            const querySnapshot = await getDocs(collection(db, 'livros'));
            allBooks = [];
            querySnapshot.forEach(doc_snap => {
                allBooks.push({ id: doc_snap.id, ...doc_snap.data() });
            });

            populateBooks(allBooks);
            populateCategories(allBooks);
            carregarCapasCitacao(allBooks);
            iniciarTrocaDeCapas();
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    window.loadUserData = async function (uid) {
        const userDoc = await getDoc(doc(db, 'usuarios', uid));
        if (userDoc.exists()) {
            userData = {
                savedBooks: userDoc.data().savedBooks || [],
                downloadedBooks: userDoc.data().downloadedBooks || [],
                readBooks: userDoc.data().readBooks || []
            };
            populateUserLists();
        } else {
            await setDoc(doc(db, 'usuarios', uid), {
                savedBooks: [],
                downloadedBooks: [],
                readBooks: []
            });
            userData = { savedBooks: [], downloadedBooks: [], readBooks: [] };
        }
    };

    window.saveUserData = async function () {
        if (currentUser) {
            await updateDoc(doc(db, 'usuarios', currentUser.uid), userData);
        }
    };

    // Firebase Auth listener
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        updateUserInterface(user);
        await loadBooks();
        loadGutenbergBooks();
        if (user) {
            await loadUserData(user.uid);
        }
    });
});

// Update UI based on auth state
function updateUserInterface(user) {
    const userSection = document.getElementById('user-section');
    if (user) {
        userSection.innerHTML = `
            <span class="welcome-message">Olá, ${user.displayName || user.email}! &nbsp;</span>
            <button class="user-btn" id="logoutBtn">
                <img draggable="false" src="img/ContaEscuro.png" id="conta-icon" style="width: 25px; height: 25px;">
            </button>
            <div class="user-form-bubble hidden" id="logoutBubble">
                <p>Você está logado como: <strong>${user.displayName || user.email}</strong></p>
                <button id="logoutButton">Sair</button>
            </div>
        `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            document.getElementById('logoutBubble').classList.toggle('hidden');
        });

        document.getElementById('logoutButton').addEventListener('click', async () => {
            await signOut(auth);
            location.reload();
        });

        // Show user-specific sections
        showUserSections(true);
    } else {
        userSection.innerHTML = `
            <button class="user-btn" id="signInBtn">
                <img draggable="false" src="img/ContaEscuro.png" id="conta-icon" style="width: 25px; height: 25px;">
                Sign In with Google
            </button>
        `;

        document.getElementById('signInBtn').addEventListener('click', googleSignIn);

        showUserSections(false);
    }
}

// Show/hide user-specific sections
function showUserSections(show) {
    const sections = ['download-section', 'salvos-section', 'lidos-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = show ? 'block' : 'none';
    });
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    messageDiv.style.display = 'block';
    setTimeout(() => messageDiv.style.display = 'none', 5000);
}

// Sign In Button Event
document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', googleSignIn);
    }
});


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

    if (searchInput && resultsContainer) {
        // Search functionality
        function atualizarResultados(query) {
            resultsContainer.innerHTML = "";

            if (query.trim() === "") {
                resultsContainer.classList.add("hidden");
                return;
            }

            const filtrados = allBooks.filter(livro =>
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
                            openRightSidebar(livro.link, livro.id, !!currentUser);
                        } else {
                            alert("Este livro não possui PDF disponível.");
                        }
                    });

                    resultsContainer.appendChild(item);
                });
            }

            resultsContainer.classList.remove("hidden");
        }

        searchInput.addEventListener("input", () => {
            const query = searchInput.value;
            atualizarResultados(query);
        });

        // Close search results when clicking outside
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".search-container")) {
                resultsContainer.classList.add("hidden");
            }
        });
    }
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

// Save/unsave book for user
async function salvarLivro(livroId, buttonElement) {
    if (!currentUser) {
        alert("Você precisa estar logado para salvar livros.");
        return;
    }

    const isSaved = userData.savedBooks.includes(livroId);
    if (isSaved) {
        // Remove from saved
        userData.savedBooks = userData.savedBooks.filter(id => id !== livroId);
    } else {
        // Add to saved
        userData.savedBooks.push(livroId);
    }

    await saveUserData();

    // Update button
    buttonElement.classList.toggle("salvo");

    // Reload saved section
    populateUserLists();
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
                    openRightSidebar(link, livro.id, !!currentUser);
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

                if (currentUser) {
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
            closeRightSidebar(); // Close sidebar if open
        } else {
            location.reload(); // Reload page otherwise
        }
    });
}

// Close sidebar when clicking outside
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
