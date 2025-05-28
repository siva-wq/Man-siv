<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['post_id'], $data['user_id'], $data['like'])) {
        $post_id = (int) $data['post_id'];
        $user_id = (int) $data['user_id'];
        $like = filter_var($data['like'], FILTER_VALIDATE_BOOLEAN);

        try {
            // Check if the user already liked the post
            $query = "SELECT * FROM likes WHERE post_id = :post_id AND user_id = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Like exists
                if (!$like) {
                    // Remove like
                    $deleteQuery = "DELETE FROM likes WHERE post_id = :post_id AND user_id = :user_id";
                    $deleteStmt = $db->prepare($deleteQuery);
                    $deleteStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                    $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                    $deleteStmt->execute();

                    // Decrease total likes
                    $updateQuery = "UPDATE posts SET total_likes = total_likes - 1 WHERE id = :post_id AND total_likes > 0";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                    $updateStmt->execute();
                }
            } else {
                // No like exists
                if ($like) {
                    // Add like
                    $insertQuery = "INSERT INTO likes (post_id, user_id, created_at) VALUES (:post_id, :user_id, NOW())";
                    $insertStmt = $db->prepare($insertQuery);
                    $insertStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                    $insertStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                    $insertStmt->execute();

                    // Increase total likes
                    $updateQuery = "UPDATE posts SET total_likes = total_likes + 1 WHERE id = :post_id";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                    $updateStmt->execute();
                }
            }

            // Fetch the updated total likes
            $likesQuery = "SELECT total_likes FROM posts WHERE id = :post_id";
            $likesStmt = $db->prepare($likesQuery);
            $likesStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $likesStmt->execute();
            $total_likes = $likesStmt->fetchColumn();

            echo json_encode([
                "message" => "Like toggled successfully",
                "status" => "success",
                "total_likes" => $total_likes
            ]);
        } catch (PDOException $e) {
            error_log("SQL Error: " . $e->getMessage());
            echo json_encode(["message" => "SQL Error: " . $e->getMessage(), "status" => "error"]);
        }
    } else {
        echo json_encode(["message" => "Invalid request payload", "status" => "error"]);
    }
} else {
    echo json_encode(["message" => "Invalid request method", "status" => "error"]);
}
?>
