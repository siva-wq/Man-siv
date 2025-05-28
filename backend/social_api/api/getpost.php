<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $pdo = (new Database())->getConnection();

       
        $stmt = $pdo->prepare("SELECT * FROM posts"); 
        $stmt->execute();

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($posts) {
           
            echo json_encode(['posts' => $posts]);
        } else {
           
            http_response_code(404);
            echo json_encode(['message' => 'No posts found.']);
        }
    } catch (PDOException $e) {
    
        http_response_code(500);
        echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
   
    http_response_code(405);
    echo json_encode(['message' => 'Invalid request method. Only GET is allowed.']);
}
?>
