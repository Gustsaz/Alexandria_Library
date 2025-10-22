<?php
session_start();
$arquivo_usuarios = 'data/usuarios.json';

if (!isset($_SESSION['ID_usuario'])) {
    echo json_encode(['erro' => 'Usuário não está logado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$livroId = $data['livroId'] ?? null;

if (!$livroId) {
    echo json_encode(['erro' => 'ID do livro ausente']);
    exit;
}

$usuarios = json_decode(file_get_contents($arquivo_usuarios), true);
foreach ($usuarios as &$usuario) {
    if ($usuario['ID_usuario'] == $_SESSION['ID_usuario']) {
        if (!in_array($livroId, $usuario['livros_salvos'] ?? [])) {
            $usuario['livros_salvos'][] = $livroId;
        }
        break;
    }
}

file_put_contents($arquivo_usuarios, json_encode($usuarios, JSON_PRETTY_PRINT));
echo json_encode(['sucesso' => true]);
