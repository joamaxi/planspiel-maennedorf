<?php
/**
 * save_score.php – Planspiel Bülach
 * Empfängt JSON via POST und speichert es als team_X_score.json im scores/-Verzeichnis.
 * Aufruf: POST http://<SERVER-IP>:8888/planspiel-buelach/save_score.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['team'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Kein gültiges JSON oder Team fehlt']);
    exit;
}

$team     = preg_replace('/[^0-9]/', '', (string)$data['team']);
$filename = __DIR__ . '/scores/team_' . $team . '_score.json';

if (file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Datei konnte nicht gespeichert werden']);
    exit;
}

echo json_encode(['success' => true, 'file' => 'team_' . $team . '_score.json']);
