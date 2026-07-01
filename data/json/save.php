<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$body = file_get_contents('php://input');
$req  = json_decode($body, true);

if (!$req || empty($req['filename']) || !isset($req['data'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing filename or data']);
    exit;
}

/* Nur sichere Dateinamen erlauben: alphanumerisch, Bindestriche, Unterstriche, Punkt + .json */
$filename = $req['filename'];
if (!preg_match('/^[a-zA-Z0-9_\-]+\.json$/', $filename)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid filename']);
    exit;
}

$path   = __DIR__ . '/' . $filename;
$content = is_string($req['data']) ? $req['data'] : json_encode($req['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($path, $content) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not write file']);
    exit;
}

echo json_encode(['ok' => true, 'filename' => $filename]);
