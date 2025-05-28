<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        
        $pdo = (new Database())->getConnection();
        
       
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

        if ($userId) {
           
            $stmt = $pdo->prepare("SELECT * FROM posts WHERE user_id = :user_id ORDER BY created_at DESC");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();

            // Fetch all posts
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($posts) {
                http_response_code(200);
                echo json_encode(['status' => 'success', 'posts' => $posts]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'No posts found for the given user ID.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid or missing user ID.',"userid"=>$userId]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method. Only GET is allowed.']);
}
?>
