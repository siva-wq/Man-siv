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

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['user_id'])) {
    $user_id = intval($data['user_id']);
    
  
    $is_online = 1; 
    if (isset($data['is_online'])) {
        $is_online = $data['is_online'] ? 1 : 0;
    } else if (isset($data['status'])) {
        $is_online = ($data['status'] === 'online') ? 1 : 0;
    }
    
 
    $sql = "INSERT INTO user_status (user_id, is_online, last_active) 
            VALUES (?, ?, CURRENT_TIMESTAMP) 
            ON DUPLICATE KEY UPDATE 
            is_online = VALUES(is_online), 
            last_active = CURRENT_TIMESTAMP";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $is_online);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "user_id" => $user_id,
            "is_online" => $is_online
        ]);
    } else {
        echo json_encode([
            "error" => "Failed to update status",
            "sql_error" => $conn->error
        ]);
    }
} else {
    echo json_encode(["error" => "Missing user_id parameter"]);
}

$conn->close();
?>
