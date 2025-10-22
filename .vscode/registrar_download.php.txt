<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['ID_usuario'])) {
    echo json_encode(['sucesso' => false, 'erro' => 'Usuário não autenticado']);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);
$livroId = $dados['livroId'] ?? null;

if (!$livroId) {
    echo json_encode(['sucesso' => false, 'erro' => 'ID do livro não enviado']);
    exit;
}

$arquivo = 'data/usuarios.json';
if (!file_exists($arquivo)) {
    echo json_encode(['sucesso' => false, 'erro' => 'Arquivo de usuários não encontrado']);
    exit;
}

$usuarios = json_decode(file_get_contents($arquivo), true);
$modificado = false;

foreach ($usuarios as &$usuario) {
    if ($usuario['ID_usuario'] == $_SESSION['ID_usuario']) {
        if (!isset($usuario['livros_baixados'])) {
            $usuario['livros_baixados'] = [];
        }
        if (!in_array($livroId, $usuario['livros_baixados'])) {
            $usuario['livros_baixados'][] = $livroId;
            $modificado = true;
        }
        break;
    }
}

if ($modificado) {
    file_put_contents($arquivo, json_encode($usuarios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode(['sucesso' => true]);
