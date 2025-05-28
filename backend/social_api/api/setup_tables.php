<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include_once '../config/db.php';
$db = (new Database())->getConnection();

try {
   
    $sql = "CREATE TABLE IF NOT EXISTS user_status (
        user_id INT PRIMARY KEY,
        is_online BOOLEAN DEFAULT FALSE,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";

    if (!$db->query($sql)) {
        throw new Exception("Error creating user_status table: " . $db->error);
    }

    echo json_encode([
        "success" => true,
        "message" => "Tables created successfully"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?>
