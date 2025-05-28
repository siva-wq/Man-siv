<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    try {
        $pdo = (new Database())->getConnection();
    } catch (PDOException $e) {
        echo json_encode(['message' => 'Database connection error: ' . $e->getMessage()]);
        exit;
    }
    if (isset($_POST['userId']) && isset($_POST['uname'])) {
        $userId = filter_var($_POST['userId'], FILTER_VALIDATE_INT);
        $uname = htmlspecialchars(trim($_POST['uname']), ENT_QUOTES, 'UTF-8');

        if (!$userId || empty($uname)) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid input.']);
            exit;
        }

        
        try {
            $stmt = $pdo->prepare("UPDATE users SET name = :uname WHERE id = :user_id");
            $stmt->bindParam(':uname', $uname, PDO::PARAM_STR);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode([
                    "message" => "User name updated successfully.",
                    "userId" => $userId,
                    "updatedName" => $uname,
                    "status"=>true

                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update user name.","status"=>false]);
            }
        } catch (PDOException $e) {
           
            error_log($e->getMessage(), 3, '/var/log/php_errors.log');

            http_response_code(500);
            echo json_encode(['message' => 'An internal server error occurred.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid request. Missing userId or uname.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Invalid request method.']);
}
?>
