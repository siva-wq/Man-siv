<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); 
    exit;
}


include_once '../config/db.php';

try {
    $db = (new Database())->getConnection();

   
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);t
            echo json_encode(["message" => "Invalid JSON payload"]);
            exit;
        }

     
        $userId = isset($data['user_id']) ? intval($data['user_id']) : null;
        $bio = isset($data['bio']) ? trim($data['bio']) : null;

        
        if (empty($userId) || empty($bio)) {
            http_response_code(400); 
            echo json_encode(["message" => "Missing or invalid user_id or bio"]);
            exit;
        }

        
        $checkQuery = "SELECT COUNT(*) FROM user_bios WHERE user_id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $checkStmt->execute();
        $userExists = $checkStmt->fetchColumn();

        if ($userExists) {
            
            $updateQuery = "UPDATE user_bios SET bio = :bio WHERE user_id = :user_id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':bio', $bio, PDO::PARAM_STR);
            $updateStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);

            if ($updateStmt->execute()) {
                http_response_code(200); 
                echo json_encode(["message" => "User bio updated successfully"]);
            } else {
                http_response_code(500); 
                echo json_encode(["message" => "Failed to update user bio"]);
            }
        } else {
           
            $insertQuery = "INSERT INTO user_bios (user_id, bio) VALUES (:user_id, :bio)";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $insertStmt->bindParam(':bio', $bio, PDO::PARAM_STR);

            if ($insertStmt->execute()) {
                http_response_code(201); 
                echo json_encode(["message" => "User bio created successfully"]);
            } else {
                http_response_code(500); 
                echo json_encode(["message" => "Failed to create user bio"]);
            }
        }
    } else {
        http_response_code(405); 
        echo json_encode(["message" => "Invalid request method"]);
    }
} catch (PDOException $e) {
    http_response_code(500); 
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode(["message" => "Unexpected error: " . $e->getMessage()]);
}
?>
