<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: text/html; charset=utf-8');

$arquivo_usuarios = 'data/usuarios.json';

if (!file_exists($arquivo_usuarios) || filesize($arquivo_usuarios) == 0) {
    file_put_contents($arquivo_usuarios, json_encode([]));
}

function carregarUsuarios($arquivo)
{
    $conteudo = file_get_contents($arquivo);
    $usuarios = json_decode($conteudo, true);
    return is_array($usuarios) ? $usuarios : [];
}

function salvarUsuarios($arquivo, $usuarios)
{
    file_put_contents($arquivo, json_encode($usuarios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function gerarNovoId($usuarios)
{
    if (empty($usuarios))
        return 1;
    $ids = array_column($usuarios, 'ID_usuario');
    return max($ids) + 1;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? '';

    if ($acao === 'cadastrar') {
        $nome = htmlspecialchars(trim($_POST['nome'] ?? ''));
        $email = htmlspecialchars(trim($_POST['email'] ?? ''));
        $senha = $_POST['senha'] ?? '';

        // Validações
        if (empty($nome) || empty($email) || empty($senha)) {
            $_SESSION['message'] = ['type' => 'error', 'text' => 'Preencha todos os campos.'];
            header('Location: index.php');
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['message'] = ['type' => 'error', 'text' => 'Formato de e-mail inválido.'];
            header('Location: index.php');
            exit();
        }

        // Validação de senha forte
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/', $senha)) {
            $_SESSION['message'] = [
                'type' => 'error',
                'text' => 'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um caractere especial.'
            ];
            header("Location: index.php");
            exit;
        }


        $usuarios = carregarUsuarios($arquivo_usuarios);

        foreach ($usuarios as $usuario) {
            if (strtolower($usuario['email_usuario']) === strtolower($email)) {
                $_SESSION['message'] = ['type' => 'error', 'text' => 'Este e-mail já está cadastrado.'];
                header('Location: index.php');
                exit();
            }
        }

        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        $novo_usuario = [
            'ID_usuario' => gerarNovoId($usuarios),
            'nome_usuario' => $nome,
            'email_usuario' => $email,
            'senha_usuario' => $senha_hash,
            'livros_baixados' => [],
            'livros_salvos' => [],
            'livros_lidos' => []
        ];

        $usuarios[] = $novo_usuario;
        salvarUsuarios($arquivo_usuarios, $usuarios);

        $_SESSION['ID_usuario'] = $novo_usuario['ID_usuario'];
        $_SESSION['nome_usuario'] = $novo_usuario['nome_usuario'];
        $_SESSION['email_usuario'] = $novo_usuario['email_usuario'];
        $_SESSION['message'] = ['type' => 'success', 'text' => 'Cadastro realizado com sucesso! Você foi logado.'];

        header('Location: index.php');
        exit();

    } elseif ($acao === 'login') {
        $email = htmlspecialchars(trim($_POST['email'] ?? ''));
        $senha = $_POST['senha'] ?? '';

        if (empty($email) || empty($senha)) {
            $_SESSION['message'] = ['type' => 'error', 'text' => 'Preencha todos os campos para fazer login.'];
            header('Location: index.php');
            exit();
        }

        $usuarios = carregarUsuarios($arquivo_usuarios);
        $usuario_encontrado = null;

        foreach ($usuarios as $usuario) {
            if (strtolower($usuario['email_usuario']) === strtolower($email)) {
                $usuario_encontrado = $usuario;
                break;
            }
        }

        if ($usuario_encontrado && password_verify($senha, $usuario_encontrado['senha_usuario'])) {
            $_SESSION['ID_usuario'] = $usuario_encontrado['ID_usuario'];
            $_SESSION['nome_usuario'] = $usuario_encontrado['nome_usuario'];
            $_SESSION['email_usuario'] = $usuario_encontrado['email_usuario'];
            $_SESSION['message'] = ['type' => 'success', 'text' => 'Login realizado com sucesso!'];

            header('Location: index.php');
            exit();
        } else {
            $_SESSION['message'] = ['type' => 'error', 'text' => 'E-mail ou senha incorretos.'];
            header('Location: index.php');
            exit();
        }
    }
}

header('Location: index.php');
exit();
