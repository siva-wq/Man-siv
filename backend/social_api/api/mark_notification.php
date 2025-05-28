<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['notification_id'])) {
        if ($data['notification_id'] === 'all') {
            
            if (isset($data['user_id'])) {
                $user_id = intval($data['user_id']);
                $sql = "UPDATE notifications SET status = 'read' WHERE user_id = ?";
                $stmt = $db->prepare($sql);
                $stmt->bind_param("i", $user_id);
            } else {
                echo json_encode(["error" => "User ID is required for marking all as read"]);
                exit;
            }
        } else {
            
            $notification_id = intval($data['notification_id']);
            $sql = "UPDATE notifications SET status = 'read' WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->bind_param("i", $notification_id);
        }

        if ($stmt->execute()) {
            echo json_encode(["success" => "Notification(s) marked as read"]);
        } else {
            echo json_encode(["error" => "Failed to mark notification(s) as read"]);
        }
    } else {
        echo json_encode(["error" => "Notification ID is required"]);
    }
}

$db->close();
?>
