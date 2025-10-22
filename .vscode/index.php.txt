<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

header('Content-Type: text/html; charset=utf-8');

// Mensagem de erro/sucesso para o JS:
if (isset($_SESSION['message'])) {
    echo "<script>";
    echo "window.authMessage = " . json_encode($_SESSION['message']) . ";";
    echo "</script>";
    unset($_SESSION['message']);
}

function contarLivrosPorCategoria($livros, $categoria)
{
    return count(livrosPorCategoria($livros, $categoria));
}

$arquivo_usuarios = 'data/usuarios.json';
if (!file_exists(dirname($arquivo_usuarios))) {
    mkdir(dirname($arquivo_usuarios), 0777, true);
}
if (!file_exists($arquivo_usuarios) || filesize($arquivo_usuarios) == 0) {
    file_put_contents($arquivo_usuarios, json_encode([]));
}

$logado = isset($_SESSION['ID_usuario']);
$nome_usuario = $logado ? $_SESSION['nome_usuario'] : '';

$messageHtml = '';
if (isset($_SESSION['message'])) {
    $type = $_SESSION['message']['type'];
    $text = htmlspecialchars($_SESSION['message']['text']);
    $messageHtml = "<div class='message $type'>$text</div>";
    unset($_SESSION['message']);
}

$livros = [];
$caminho_livros = 'data/livros.json';

if (file_exists($caminho_livros)) {
    $json_livros = file_get_contents($caminho_livros);
    $livros = json_decode($json_livros, true);
}

function livrosPorCategoria($livros, $categoria)
{
    if ($categoria === 'Todos') {
        return $livros;
    }
    return array_filter($livros, function ($livro) use ($categoria) {
        return strtolower($livro['categoria']) === strtolower($categoria);
    });
}

$livros_filtrados = [];
$busca_ativa = false;

if (isset($_GET['busca']) && !empty(trim($_GET['busca']))) {
    $busca = strtolower(trim($_GET['busca']));
    $livros_filtrados = array_filter($livros, function ($livro) use ($busca) {
        return strpos(strtolower($livro['nome']), $busca) !== false;
    });
    $busca_ativa = true;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Alexandria Biblioteca</title>
    <link rel="icon" href="/img/icons/LogoMiniaturaClaro.png" type="image/png">
    <link rel="stylesheet" href="style.css">
</head>

<body>

    <div class="sidebar">
        <button class="toggle-btnL"><img draggable="false" src="img/LogoEscuro.png" alt="Logo Alexandria"
                class="logo-sidebar"></button>

        <button class="mode-toggle">
            <img draggable="false" id="theme-icon" src="img/Escuro.png" alt="Tema" class="tema-icone">
        </button>
        <?php if ($logado): ?>
            <button class="download-button"><img draggable="false" id="download-icon" src="img/DownloadEscuro.png"
                    class="download-icon" alt="Baixados"></button>
            <button class="saved-button"><img draggable="false" id="saved-icon" src="img/SavedEscuro.png" class="saved-icon"
                    alt="salvos"></button>
            <button class="visua-button"><img draggable="false" id="visua-icon" src="img/EyeEscuro.png" class="visua-icon"
                    alt="já lidos"></button>
        <?php endif; ?>
        <button class="info-button"><img draggable="false" id="info-icon" src="img/InfoEscuro.png" class="info-icon"
                alt="informação"></button>
    </div>

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

        <?php if (!$busca_ativa): ?>

            <div class="citacao-container">

                <div class="citacao-imagem scroll-reveal-cascade delay-1">
                    <img src="img/platao.png" alt="Platão">
                </div>
                <!-- Citação -->
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

            <nav class="categories">
                <div class="category active scroll-reveal-cascade delay-1" data-category="Todos">
                    <img draggable="false" src="/img/icons/todos.png" alt="Todos">
                    Todos (<?php echo contarLivrosPorCategoria($livros, 'Todos') + 20; ?>)
                </div>


                <div class="category scroll-reveal-cascade delay-4" data-category="Aventura">
                    <img draggable="false" src="/img/icons/aventura.png" alt="Aventura">
                    Aventura (<?php echo contarLivrosPorCategoria($livros, 'Aventura'); ?>)
                </div>

                <div class="category scroll-reveal-cascade delay-5" data-category="Fantasia">
                    <img draggable="false" src="/img/icons/fantasia.png" alt="Fantasia">
                    Fantasia (<?php echo contarLivrosPorCategoria($livros, 'Fantasia'); ?>)
                </div>

                <div class="category scroll-reveal-cascade delay-6" data-category="Romance">
                    <img draggable="false" src="/img/icons/romance.png" alt="Romance">
                    Romance (<?php echo contarLivrosPorCategoria($livros, 'Romance'); ?>)
                </div>

                <div class="category scroll-reveal-cascade delay-7" data-category="Scifi">
                    <img draggable="false" src="/img/icons/ficcao.png" alt="Suspense">
                    Sci-fi (<?php echo contarLivrosPorCategoria($livros, 'Scifi'); ?>)
                </div>

                <div class="category scroll-reveal-cascade delay-7" data-category="Suspense">
                    <img draggable="false" src="/img/icons/suspense.png" alt="Suspense">
                    Suspense (<?php echo contarLivrosPorCategoria($livros, 'Suspense'); ?>)
                </div>

                <div class="category scroll-reveal-cascade delay-7" data-category="terror">
                    <img draggable="false" src="/img/icons/horror.png" alt="Terror">
                    Terror (<?php echo contarLivrosPorCategoria($livros, 'terror'); ?>)
                </div>

                <div class="category scroll-reveal-cascade delay-7" data-category="Quadrinho">
                    <img draggable="false" src="/img/icons/quadrinho.png" alt="Quadrinho">
                    Quadrinhos (<?php echo contarLivrosPorCategoria($livros, 'Quadrinho'); ?>)
                </div>
                
                <div class="category scroll-reveal-cascade delay-7" data-category="Gutenberg">
                    <img draggable="false" src="/img/icons/gutenberg.png" alt="Gutenberg">
                    Clássicos (<?php echo 20 ?>)
                </div>

            </nav>
        <?php endif; ?>


        <?php if ($busca_ativa): ?>
            <section class="highlight">
                <h2>Resultados da busca por "<?php echo htmlspecialchars($_GET['busca']); ?>"</h2>
                <?php if (!empty($livros_filtrados)): ?>
                    <div class="book-list">
                        <?php foreach ($livros_filtrados as $livro): ?>
                            <div class="book">
                                <img src="<?php echo htmlspecialchars($livro['capa']); ?>"
                                    alt="Capa do livro <?php echo htmlspecialchars($livro['nome']); ?>" width="120">
                                <h3><?php echo htmlspecialchars($livro['nome']); ?></h3>
                                <p><strong>Autor:</strong> <?php echo htmlspecialchars($livro['autor']); ?></p>
                                <p><strong>Editora:</strong> <?php echo htmlspecialchars($livro['editora']); ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p>Nenhum resultado encontrado.</p>
                <?php endif; ?>
            </section>
        <?php else: ?>
            <section class="highlight scroll-reveal" data-category="Todos">
                <h2>Todos</h2>
                <div class="book-list">
                    <?php
                    $todos = livrosPorCategoria($livros, 'Todos');
                    foreach ($todos as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img id="salvar-icon" src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Aventura">
                <h2>Aventura</h2>
                <div class="book-list">
                    <?php
                    $aventura = livrosPorCategoria($livros, 'Aventura');
                    foreach ($aventura as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Fantasia">
                <h2>Fantasia</h2>
                <div class="book-list">
                    <?php
                    $fantasia = livrosPorCategoria($livros, 'Fantasia');
                    foreach ($fantasia as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Romance">
                <h2>Romance</h2>
                <div class="book-list">
                    <?php
                    $romance = livrosPorCategoria($livros, 'Romance');
                    foreach ($romance as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Suspense">
                <h2>Suspense</h2>
                <div class="book-list">
                    <?php
                    $suspense = livrosPorCategoria($livros, 'Suspense');
                    foreach ($suspense as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>

            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Scifi">
                <h2>Sci-fi</h2>
                <div class="book-list">
                    <?php
                    $Scifi = livrosPorCategoria($livros, 'Scifi');
                    foreach ($Scifi as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="terror">
                <h2>Terror</h2>
                <div class="book-list">
                    <?php
                    $terror = livrosPorCategoria($livros, 'terror');
                    foreach ($terror as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Quadrinho">
                <h2>Quadrinhos</h2>
                <div class="book-list">
                    <?php
                    $Quadrinho = livrosPorCategoria($livros, 'Quadrinho');
                    foreach ($Quadrinho as $livro) {
                        $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                        $idLivro = $livro['id'];

                        echo '<div class="book" id="livro-' . $idLivro . '" onclick="openRightSidebar(\'' . $link . '\', \'' . $idLivro . '\', ' . ($logado ? 'true' : 'false') . ')">';
                        echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '">';
                        echo '<div class="detalhes">';
                        echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                        echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                        echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                        echo '</div>';

                        // Botão de salvar se logado
                        if ($logado) {
                            $salvo = isset($usuarioAtual['livros_salvos']) && in_array($idLivro, $usuarioAtual['livros_salvos']);
                            $classeSalvo = $salvo ? 'salvo' : '';
                            echo '<button class="salvar-btn ' . $classeSalvo . '" onclick="event.stopPropagation(); salvarLivro(\'' . $idLivro . '\', this)">
                    <img src="img/SalvarEscuro.png" alt="Salvar" class="salvar-img">
                </button>';
                        }

                        echo '</div>';
                    }
                    ?>
                </div>
            </section>

            <br>

            <section class="highlight scroll-reveal" data-category="Gutenberg">
                <h2>Clássicos (Gutenberg)</h2>
                <div class="book-list" id="gutenberg-list">
                    <!-- Livros da API aparecerão aqui via JS -->
                </div>
            </section>


            <br>

            <?php if ($logado): ?>
                <section class="highlight scroll-reveal" data-category="download">
                    <h2>Baixados</h2>
                    <div class="book-list">
                        <?php
                        $download = [];
                        if ($logado) {
                            $usuarios = json_decode(file_get_contents('data/usuarios.json'), true);
                            foreach ($usuarios as $usuario) {
                                if ($usuario['ID_usuario'] == $_SESSION['ID_usuario']) {
                                    $idsBaixados = $usuario['livros_baixados'] ?? [];
                                    break;
                                }
                            }

                            $download = array_filter($livros, function ($livro) use ($idsBaixados) {
                                return isset($livro['id']) && in_array($livro['id'], $idsBaixados);
                            });
                        }

                        foreach ($download as $livro) {
                            $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                            echo '<div class="book" onclick="openRightSidebar(\'' . $link . '\', \'' . $livro['id'] . '\', ' . ($logado ? 'true' : 'false') . ')">';
                            echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro ' . htmlspecialchars($livro['nome']) . '" width="120">';
                            echo '<div class="detalhes">';
                            echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                            echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                            echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                            echo '</div>';
                            echo '</div>';
                        }
                        ?>
                    </div>
                </section>

                <br>

                <section class="highlight highlight-saved scroll-reveal" data-category="salvos">
                    <h2>Salvos</h2>
                    <div class="book-list">
                        <?php
                        $usuarioAtual = null;
                        foreach ($usuarios as $u) {
                            if ($u['ID_usuario'] == $_SESSION['ID_usuario']) {
                                $usuarioAtual = $u;
                                break;
                            }
                        }

                        if ($usuarioAtual && isset($usuarioAtual['livros_salvos'])) {
                            foreach ($livros as $livro) {
                                if (in_array($livro['id'], $usuarioAtual['livros_salvos'])) {
                                    $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                                    echo '<div class="book" onclick="openRightSidebar(\'' . $link . '\', \'' . $livro['id'] . '\', true)">';
                                    echo '<img draggable="false" src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro">';
                                    echo '<div class="detalhes">';
                                    echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                                    echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                                    echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                                    echo '</div></div>';
                                }
                            }
                        }
                        ?>
                    </div>
                </section>

                <br>

                <section class="highlight scroll-reveal" data-category="lidos">
                    <h2>Já Lidos</h2>
                    <div class="book-list">
                        <?php
                        foreach ($livros as $livro) {
                            if (isset($usuarioAtual['livros_lidos']) && in_array($livro['id'], $usuarioAtual['livros_lidos'])) {
                                $link = isset($livro['link']) ? htmlspecialchars($livro['link']) : '';
                                echo '<div class="book" onclick="openRightSidebar(\'' . $link . '\', \'' . $livro['id'] . '\', true)">';
                                echo '<img src="' . htmlspecialchars($livro['capa']) . '" alt="Capa do livro">';
                                echo '<div class="detalhes">';
                                echo '<h3>' . htmlspecialchars($livro['nome']) . '</h3>';
                                echo '<p><strong>Autor:</strong> ' . htmlspecialchars($livro['autor']) . '</p>';
                                echo '<p><strong>Editora:</strong> ' . htmlspecialchars($livro['editora']) . '</p>';
                                echo '</div></div>';
                            }
                        }
                        ?>
                    </div>
                </section>

            <?php endif; ?>

            <br>

            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-about">
                        <h2>Alexandria Biblioteca</h2>
                        <p>Explore uma vasta coleção de livros em PDF gratuitamente. Conhecimento ao alcance de todos.
                        </p>
                        <br>
                    </div>

                    <div class="footer-social">
                        <h3>Nos siga</h3>
                        <br>
                        <div class="social-icons">
                            <a href="https://www.facebook.com/profile.php?id=61576951933968"><img src="img/faceClaro.png"
                                    alt="Facebook" /></a>
                            <a href="https://www.instagram.com/bibl.iotecaalexandria/"><img src="img/instaClaro.png"
                                    alt="Instagram" /></a>
                            <a href="https://x.com/_Alexandria_Lib"><img src="img/XClaro.png" alt="Twitter" /></a>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; 2025 Alexandria Biblioteca. Todos os direitos reservados.</p>
                </div>
                <br>
            </footer>

        <?php endif; ?>

        <?php echo $messageHtml; ?>

    </div>

    <div class="right-sidebar" id="rightSidebar"></div>

    <br>

    <script>
        const isUserLoggedIn = <?php echo json_encode($logado); ?>;
    </script>

    <script src="script.js"></script>

</body>

</html>
