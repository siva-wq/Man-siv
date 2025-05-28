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

 if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if (empty($_GET['sender_id']) || empty($_GET['receiver_id'])) {
        echo json_encode(["message" => "Sender ID and Receiver ID are required"]);
        http_response_code(400);
        exit;
    }

    
    $sender_id = intval($_GET['sender_id']);
    $receiver_id = intval($_GET['receiver_id']);

    $query = "SELECT * FROM messages 
              WHERE (sender_id = ? AND receiver_id = ?) 
                 OR (sender_id = ? AND receiver_id = ?)
              ORDER BY created_at ASC";
    $stmt = $db->prepare($query);

    if ($stmt->execute([$sender_id, $receiver_id, $receiver_id, $sender_id])) {
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

       
        
            if (!empty($messages['image'])) {
                echo json_encode($messages);
            }
        

        if (!empty($messages)) {
            echo json_encode($messages);
        } else {
            echo json_encode(["message" => "No messages found"]);
        }
        http_response_code(200);
    } else {
        error_log("Failed to fetch messages: " . $stmt->errorInfo()[2]);
        echo json_encode(["message" => "Failed to fetch messages"]);
        http_response_code(500);
    }
} else {
    
    echo json_encode(["message" => "Invalid request method"]);
    http_response_code(405);
}
?>
