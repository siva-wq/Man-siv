<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $data = json_decode(file_get_contents("php://input"), true);

    
    if (isset($data['post_id'], $data['user_id'], $data['comment'])) {
        $post_id = $data['post_id'];
        $user_id = $data['user_id'];
        $comment = $data['comment'];

        try {
           
            $sql = "SELECT count(*) FROM comments WHERE post_id = :post_id AND user_id = :user_id";
            $stm1 = $db->prepare($sql);
            $stm1->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $stm1->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stm1->execute();
            $count = $stm1->fetchColumn();

            
            if ($count > 0) {
                // Update existing comment
                $query = "UPDATE comments SET comment = :comment WHERE post_id = :post_id AND user_id = :user_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
                $result = $stmt->execute();
            } else {
                // Insert new comment
                $query = "INSERT INTO comments (post_id, user_id, comment) VALUES (:post_id, :user_id, :comment)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
                $result = $stmt->execute();

            }

           
            if ($result) {
                try {
                    // Prepare and execute the query
                    $stmt = $db->prepare(
                        "SELECT
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
                
            } else {
                echo json_encode(["message" => "Failed to add/update comment"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid input"]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["message" => "Only POST method is allowed"]);
}
?>
