<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/db.php';
$db = (new Database())->getConnection();

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : null;

if ($post_id === null) {
    echo json_encode(["message" => "Post ID is required.", "status" => "error"]);
    exit();
}

try {
    
    $stmt = $db->prepare(
        "SELECT
            c.post_id,
            c.user_id,
            c.comment,
            u.username
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = :post_id"
    );
    $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC); 

    if ($results) {
        echo json_encode([
            "message" => "Comments found",
            "status" => true,
            "comments" => $results 
        ]);
    } else {
        echo json_encode(["message" => "No comments found for this post.", "status" => false]);
    }
} catch (Exception $e) {
    echo json_encode(["message" => "An error occurred: " . $e->getMessage(), "status" => "error"]);
}
?>
