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


$uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/social_api/uploads/messages/";  
$imageBaseURL = "/social_api/uploads/messages/";  


if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    if (!isset($_POST['sender_id'], $_POST['receiver_id'], $_POST['message'])) {
        echo json_encode(["error" => "Missing required fields"]);
        http_response_code(400);
        exit;
    }

   
    $sender_id = intval($_POST['sender_id']);
    $receiver_id = intval($_POST['receiver_id']);
    $message = htmlspecialchars($_POST['message']);
    $imagePath = ''; 

    
    try {
        $pdo = (new Database())->getConnection();
    } catch (PDOException $e) {
        echo json_encode(['message' => 'Database connection error: ' . $e->getMessage()]);
        exit;
    }

    // Handle image upload
    if (!empty($_FILES['image']['name'])) {
        $imageName = basename($_FILES['image']['name']);
        $imagePath = $imageBaseURL . $imageName; 
        $localImagePath = $uploadDir . $imageName; 

        if (!move_uploaded_file($_FILES['image']['tmp_name'], $localImagePath)) {
            echo json_encode(["error" => "Failed to upload image"]);
            http_response_code(500);
            exit;
        }
    }

    
    try {
        $stmt = $pdo->prepare("INSERT INTO messages (sender_id, receiver_id, message, images) VALUES (?, ?, ?, ?)");
        $stmt->execute([$sender_id, $receiver_id, $message, $imagePath]);

        echo json_encode([
            "status" => "success",
            "message_id" => $pdo->lastInsertId(),
            "sender_id" => $sender_id,
            "receiver_id" => $receiver_id,
            "message" => $message,
            "images" => $imagePath
        ]);
    } catch (PDOException $e) {
        echo json_encode(['message' => 'Database error: ' . $e->getMessage(), "image" => $imagePath]);
        http_response_code(500);
    }
} else {
    echo json_encode(["message" => "Invalid request method"]);
    http_response_code(405);
}
?>
