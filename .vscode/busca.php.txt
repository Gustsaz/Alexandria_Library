<?php
header('Content-Type: application/json; charset=utf-8');

$caminho = 'data/livros.json';

if (!file_exists($caminho) || filesize($caminho) === 0) {
    echo json_encode([]);
    exit;
}

$json = file_get_contents($caminho);
$livros = json_decode($json, true);

if (!is_array($livros)) {
    echo json_encode([]);
    exit;
}

$busca = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';

$resultado = array_filter($livros, function($livro) use ($busca) {
    return $busca === '' || 
           strpos(strtolower($livro['nome']), $busca) !== false || 
           strpos(strtolower($livro['autor']), $busca) !== false;
});

echo json_encode(array_values($resultado));
exit;
?>
