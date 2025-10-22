<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
header('Content-Type: text/html; charset=utf-8');

// Mensagem de erro/sucesso para o JS
if (isset($_SESSION['message'])) {
    echo "<script>";
    echo "window.authMessage = " . json_encode($_SESSION['message']) . ";";
    echo "</script>";
    unset($_SESSION['message']);
}

// Verifica login
$logado = isset($_SESSION['ID_usuario']);
$nome_usuario = $logado ? $_SESSION['nome_usuario'] : '';

// Garante que data/usuarios.json existe
$arquivo_usuarios = 'data/usuarios.json';
if (!file_exists(dirname($arquivo_usuarios))) mkdir(dirname($arquivo_usuarios), 0777, true);
if (!file_exists($arquivo_usuarios) || filesize($arquivo_usuarios) == 0) file_put_contents($arquivo_usuarios, json_encode([]));
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Alexandria Biblioteca</title>
  <link rel="icon" href="/img/icons/LogoMiniaturaClaro.png" type="image/png">
  <link rel="stylesheet" href="style.css">
  <script>
    window.isUserLoggedIn = <?php echo $logado ? 'true' : 'false'; ?>;
    window.currentUserId = <?php echo $logado ? json_encode($_SESSION['ID_usuario']) : 'null'; ?>;
  </script>
</head>

<body>

  <!-- Sidebar -->
  <div class="sidebar">
    <button class="toggle-btnL"><img draggable="false" src="img/LogoEscuro.png" alt="Logo Alexandria" class="logo-sidebar"></button>
    <button class="mode-toggle">
      <img draggable="false" id="theme-icon" src="img/Escuro.png" alt="Tema" class="tema-icone">
    </button>
    <?php if ($logado): ?>
      <button class="download-button"><img draggable="false" id="download-icon" src="img/DownloadEscuro.png" class="download-icon" alt="Baixados"></button>
      <button class="saved-button"><img draggable="false" id="saved-icon" src="img/SavedEscuro.png" class="saved-icon" alt="Salvos"></button>
      <button class="visua-button"><img draggable="false" id="visua-icon" src="img/EyeEscuro.png" class="visua-icon" alt="Já lidos"></button>
    <?php endif; ?>
    <button class="info-button"><img draggable="false" id="info-icon" src="img/InfoEscuro.png" class="info-icon" alt="Informação"></button>
  </div>

  <!-- Conteúdo principal -->
  <div class="main-content">
    <header>
      <div class="search-container">
        <input type="text" placeholder="Buscar livros...">
        <div class="search-results hidden"></div>
      </div>

      <div class="user-info-container">
        <?php if ($logado): ?>
          <span class="welcome-message">Olá, <?php echo htmlspecialchars($nome_usuario); ?>! &nbsp;</span>
          <button class="user-btn" id="logoutBtn">
            <img draggable="false" src="img/ContaEscuro.png" id="conta-icon" style="width: 25px; height: 25px;">
          </button>
          <div class="user-form-bubble hidden" id="logoutBubble">
            <p>Você está logado como: <strong><?php echo htmlspecialchars($nome_usuario); ?></strong></p>
            <button onclick="window.location.href='logout.php'">Sair</button>
          </div>
        <?php else: ?>
          <button class="user-btn" id="userBtn">
            <img draggable="false" src="img/ContaEscuro.png" id="conta-icon" style="width: 25px; height: 25px;">
          </button>
          <div class="user-form-bubble hidden" id="userForm">
            <h2 id="form-title">Cadastro</h2>
            <div id="userMessage" class="user-alert"></div>
            <form action="auth.php" method="POST" id="auth-form">
              <input type="hidden" name="acao" value="cadastrar" id="acao">
              <div id="nome-field">
                <input type="text" name="nome" placeholder="Nome de usuário" required>
              </div>
              <input type="email" name="email" placeholder="E-mail" required>
              <input type="password" name="senha" placeholder="Senha" required>
              <div class="form-buttons">
                <button type="submit" id="submit-button">Cadastrar</button>
                <button type="button" onclick="toggleForm()">Fechar</button>
              </div>
            </form>
            <hr style="margin: 10px 0;">
            <button type="button" id="alternarFormularioBtn" class="ja_tem">Já tem uma conta? Entrar</button>
          </div>
        <?php endif; ?>
      </div>
    </header>

    <!-- Citação / Banner -->
    <div class="citacao-container">
      <div class="citacao-imagem scroll-reveal-cascade delay-1">
        <img src="img/platao.png" alt="Platão">
      </div>
      <div class="citacao-texto scroll-reveal-cascade delay-2">
        <p class="citacao-frase">“O livro é um mestre que fala, mas que não responde”</p>
        <p class="citacao-autor">- Platão</p>
      </div>
      <div class="citacao-livros">
        <div class="livro livro-1 scroll-reveal-cascade delay-1">
          <img id="citacaoLivro1" src="/img/livros/livro19.jpg" alt="Livro aleatório 1">
        </div>
        <div class="livro livro-2 scroll-reveal-cascade delay-2">
          <img id="citacaoLivro2" src="/img/livros/livro20.jpg" alt="Livro aleatório 2">
        </div>
        <div class="livro livro-3 scroll-reveal-cascade delay-3">
          <img id="citacaoLivro3" src="/img/livros/livro22.jpg" alt="Livro aleatório 3">
        </div>
      </div>
    </div>

    <div class="barra-feia"></div>

    <!-- Categorias -->
    <nav class="categories">
      <div class="category active scroll-reveal-cascade delay-1" data-category="Todos">
        <img draggable="false" src="/img/icons/todos.png" alt="Todos"> Todos
      </div>
      <div class="category scroll-reveal-cascade delay-2" data-category="Aventura">
        <img draggable="false" src="/img/icons/aventura.png" alt="Aventura"> Aventura
      </div>
      <div class="category scroll-reveal-cascade delay-3" data-category="Fantasia">
        <img draggable="false" src="/img/icons/fantasia.png" alt="Fantasia"> Fantasia
      </div>
      <div class="category scroll-reveal-cascade delay-4" data-category="Romance">
        <img draggable="false" src="/img/icons/romance.png" alt="Romance"> Romance
      </div>
      <div class="category scroll-reveal-cascade delay-5" data-category="Scifi">
        <img draggable="false" src="/img/icons/ficcao.png" alt="Sci-fi"> Sci-fi
      </div>
      <div class="category scroll-reveal-cascade delay-6" data-category="Suspense">
        <img draggable="false" src="/img/icons/suspense.png" alt="Suspense"> Suspense
      </div>
      <div class="category scroll-reveal-cascade delay-7" data-category="terror">
        <img draggable="false" src="/img/icons/horror.png" alt="Terror"> Terror
      </div>
      <div class="category scroll-reveal-cascade delay-8" data-category="Quadrinho">
        <img draggable="false" src="/img/icons/quadrinho.png" alt="Quadrinho"> Quadrinhos
      </div>
      <div class="category scroll-reveal-cascade delay-9" data-category="Gutenberg">
        <img draggable="false" src="/img/icons/gutenberg.png" alt="Gutenberg"> Clássicos
      </div>
    </nav>

    <!-- Seções de livros (preenchidas dinamicamente pelo JS) -->
    <section class="highlight scroll-reveal" data-category="Todos">
      <h2>Todos</h2>
      <div class="book-list" id="lista-todos"></div>
    </section>

    <section class="highlight scroll-reveal" data-category="Gutenberg">
      <h2>Clássicos (Gutenberg)</h2>
      <div class="book-list" id="gutenberg-list"></div>
    </section>

    <?php if ($logado): ?>
      <section class="highlight scroll-reveal" data-category="download">
        <h2>Baixados</h2>
        <div class="book-list" id="lista-baixados"></div>
      </section>

      <section class="highlight scroll-reveal" data-category="salvos">
        <h2>Salvos</h2>
        <div class="book-list" id="lista-salvos"></div>
      </section>

      <section class="highlight scroll-reveal" data-category="lidos">
        <h2>Já Lidos</h2>
        <div class="book-list" id="lista-lidos"></div>
      </section>
    <?php endif; ?>

    <footer class="footer">
      <div class="footer-container">
        <div class="footer-about">
          <h2>Alexandria Biblioteca</h2>
          <p>Explore uma vasta coleção de livros em PDF gratuitamente. Conhecimento ao alcance de todos.</p><br>
        </div>
        <div class="footer-social">
          <h3>Nos siga</h3><br>
          <div class="social-icons">
            <a href="https://www.facebook.com/profile.php?id=61576951933968"><img src="img/faceClaro.png" alt="Facebook" /></a>
            <a href="https://www.instagram.com/bibl.iotecaalexandria/"><img src="img/instaClaro.png" alt="Instagram" /></a>
            <a href="https://x.com/_Alexandria_Lib"><img src="img/XClaro.png" alt="Twitter" /></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Alexandria Biblioteca. Todos os direitos reservados.</p>
      </div><br>
    </footer>
  </div>

  <div class="right-sidebar" id="rightSidebar"></div>

  <script src="script.js"></script>
</body>
</html>
