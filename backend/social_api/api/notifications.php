<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
$db = (new Database())->getConnection();


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['user_id'])) {
        $user_id = intval($_GET['user_id']);
        $sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $notifications = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($notifications);
    } else {
        echo json_encode(["error" => "User ID is required"]);
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['user_id']) && isset($data['message'])) {
        $user_id = intval($data['user_id']);
        $message = $data['message'];
        $status = isset($data['status']) ? $data['status'] : 'unread';

       
        if (!in_array($status, ['read', 'unread'])) {
            $status = 'unread';
        }

        $sql = "INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("iss", $user_id, $message, $status);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Notification created successfully",
                "notification_id" => $db->insert_id
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Failed to create notification: " . $db->error
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "error" => "User ID and message are required"
        ]);
    }
}

$db->close();
?>
