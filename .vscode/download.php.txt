<?php
if (!isset($_GET['url'])) {
    http_response_code(400);
    echo "URL inválida";
    exit;
}

$url = urldecode($_GET['url']);
$filename = basename(parse_url($url, PHP_URL_PATH));

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
readfile($url);
exit;
?>
