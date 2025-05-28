<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($db->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $db->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['sender_id']) && isset($data['receiver_id'])) {
    $sender_id = intval($data['sender_id']);
    $receiver_id = intval($data['receiver_id']);
    
   
    $sql = "UPDATE messages 
            SET seen = 1 
            WHERE sender_id = ? 
            AND receiver_id = ? 
            AND seen = 0";
            
    $stmt = $db->prepare($sql);
    $stmt->bind_param("ii", $sender_id, $receiver_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Messages marked as seen"
        ]);
    } else {
        echo json_encode([
            "error" => "Failed to mark messages as seen",
            "details" => $db->error
        ]);
    }
} else {
    echo json_encode(["error" => "Missing required parameters"]);
}

$db->close();
?>
