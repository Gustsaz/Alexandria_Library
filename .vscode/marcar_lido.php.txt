<?php
session_start();

$arquivoUsuarios = 'data/usuarios.json';

if (!isset($_SESSION['ID_usuario'])) {
    echo json_encode(['erro' => 'Usuário não está logado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$livroId = isset($data['livroId']) ? $data['livroId'] : null;

if (!$livroId) {
    echo json_encode(['erro' => 'ID do livro ausente']);
    exit;
}

$usuarios = json_decode(file_get_contents($arquivoUsuarios), true);

foreach ($usuarios as &$usuario) {
    if ($usuario['ID_usuario'] == $_SESSION['ID_usuario']) {
        if (!isset($usuario['livros_lidos'])) {
            $usuario['livros_lidos'] = [];
        }

        if (!in_array($livroId, $usuario['livros_lidos'])) {
            $usuario['livros_lidos'][] = $livroId;
        }

        break;
    }
}

file_put_contents($arquivoUsuarios, json_encode($usuarios, JSON_PRETTY_PRINT));
echo json_encode(['sucesso' => true]);
