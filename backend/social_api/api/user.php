<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php';

try {
   
    $pdo = (new Database())->getConnection();

    $userId = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;

    if ($userId) {
       
        $stmt = $pdo->prepare("
            SELECT 
                users.id, 
                users.username,
                users.name, 
                profile_pics.profile_pic_url AS profile_pic,
                user_bios.bio AS bio
            FROM 
                users
            LEFT JOIN 
                profile_pics ON users.id = profile_pics.user_id
            LEFT JOIN
                user_bios ON users.id = user_bios.user_id
            WHERE 
                users.id = :id
        ");
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            
            echo json_encode($user);
        } else {
           
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    } else {
        
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
    }
} catch (PDOException $e) {
    
    http_response_code(500);
    error_log($e->getMessage(), 3, '/path/to/error.log'); 
    echo json_encode(['error' => 'Database error']);
} catch (Exception $e) {
    
    http_response_code(500);
    error_log($e->getMessage(), 3, '/path/to/error.log'); 
    echo json_encode(['error' => 'Unexpected error']);
}
?>
