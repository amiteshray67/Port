<?php
// Cross-device sync endpoint for the CFA L3 hub.
// Stores one opaque, client-side-encrypted blob per sync id. The server never sees the sync code or any plaintext.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const MAX_BYTES = 1500000;   // per blob
const MAX_FILES = 300;       // total sync ids this server will hold

$dir = __DIR__ . '/sync_data';
if (!is_dir($dir)) {
    @mkdir($dir, 0700, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    @file_put_contents($dir . '/index.html', '');
}
if (!is_dir($dir) || !is_writable($dir)) { http_response_code(500); echo '{"error":"storage not writable"}'; exit; }

$id = $_GET['id'] ?? '';
if (!preg_match('/^[a-f0-9]{64}$/', $id)) { http_response_code(400); echo '{"error":"bad id"}'; exit; }
$file = "$dir/$id.json";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!is_file($file)) { echo '{"rev":0,"blob":null}'; exit; }
    readfile($file); exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"error":"method"}'; exit; }

$raw = file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BYTES) { http_response_code(413); echo '{"error":"too large"}'; exit; }
$in = json_decode($raw, true);
if (!is_array($in) || !isset($in['baseRev']) || !is_int($in['baseRev']) || !isset($in['blob']) || !is_array($in['blob'])) {
    http_response_code(400); echo '{"error":"bad body"}'; exit;
}
if (!is_file($file) && count(glob("$dir/*.json")) >= MAX_FILES) { http_response_code(507); echo '{"error":"server full"}'; exit; }

$lock = fopen("$dir/$id.lock", 'c');
flock($lock, LOCK_EX);
$cur = is_file($file) ? json_decode(file_get_contents($file), true) : ['rev' => 0, 'blob' => null];
$curRev = (int)($cur['rev'] ?? 0);
if ($in['baseRev'] !== $curRev) {
    http_response_code(409); echo json_encode($cur); flock($lock, LOCK_UN); exit;
}
$new = ['rev' => $curRev + 1, 'blob' => $in['blob'], 'updated' => gmdate('c')];
$tmp = "$dir/$id.tmp";
file_put_contents($tmp, json_encode($new));
rename($tmp, $file);
flock($lock, LOCK_UN);
echo json_encode(['rev' => $new['rev']]);
