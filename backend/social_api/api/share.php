<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/db.php';
$db = (new Database())->getConnection();


$data = json_decode(file_get_contents("php://input"), true);


if (empty($data['sender_id']) || empty($data['receiver_id']) || empty($data['shared_message_id'])) {
    echo json_encode(["message" => "Missing required fields"]);
    http_response_code(400);
    exit;
}

$sender_id = intval($data['sender_id']);
$receiver_id = intval($data['receiver_id']);
$msg_id = intval($data['shared_message_id']);


$stmt = $db->prepare("SELECT message, images FROM messages WHERE id = ?");
$stmt->execute([$msg_id]);
$original = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$original) {
    echo json_encode(["message" => "Original message not found"]);
    http_response_code(404);
    exit;
}


$insert = $db->prepare("INSERT INTO messages (sender_id, receiver_id, message, images) VALUES (?, ?, ?, ?)");
$insert->execute([$sender_id, $receiver_id, $original['message'], $original['images']]);

echo json_encode(["message" => "Message shared successfully"]);
http_response_code(200);

?>
