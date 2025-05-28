<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php';

$uploadDir = "C:/Users/hp/OneDrive/Desktop/Desktop/ManSiv/my-app/public/uploads/posts/"; 
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true); 
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle POST requests
    if (isset($_FILES['post_file']) && isset($_POST['user_id']) && isset($_POST['description'])) {
        $userId = intval($_POST['user_id']); 
        $description = htmlspecialchars($_POST['description'], ENT_QUOTES, 'UTF-8'); 
        $fileName = basename($_FILES['post_file']['name']);
        $targetFilePath = $uploadDir . $fileName;

        // Create a database connection
        try {
            $pdo = (new Database())->getConnection();
        } catch (PDOException $e) {
            echo json_encode(['message' => 'Database connection error: ' . $e->getMessage()]);
            exit;
        }

        
        try {
            $stmt = $pdo->prepare("SELECT * FROM posts WHERE user_id = :user_id AND image = :file_name");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':file_name', $fileName, PDO::PARAM_STR);
            $stmt->execute();
            $existingPost = $stmt->fetch(PDO::FETCH_ASSOC);

            
            if (move_uploaded_file($_FILES['post_file']['tmp_name'], $targetFilePath)) {
                $fileUrl =$uploadDir. $fileName; 

                if ($existingPost) {
                   
                    $stmt = $pdo->prepare("
                        UPDATE posts 
                        SET content = :description, image = :file_url 
                        WHERE user_id = :user_id AND image = :file_name
                    ");
                    $stmt->bindParam(':description', $description, PDO::PARAM_STR);
                    $stmt->bindParam(':file_url', $fileUrl, PDO::PARAM_STR);
                    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $stmt->bindParam(':file_name', $fileName, PDO::PARAM_STR);

                    if ($stmt->execute()) {
                        echo json_encode(['message' => 'Post updated successfully.']);
                    } else {
                        echo json_encode(['message' => 'Database error: Unable to update post.']);
                    }
                } else {
                    // Insert a new post
                    $stmt = $pdo->prepare("
                        INSERT INTO posts (user_id, content, image) 
                        VALUES (:user_id, :description, :file_url)
                    ");
                    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $stmt->bindParam(':description', $description, PDO::PARAM_STR);
                    $stmt->bindParam(':file_url', $fileUrl, PDO::PARAM_STR);

                    if ($stmt->execute()) {
                        echo json_encode(['message' => 'Post uploaded successfully!']);
                    } else {
                        echo json_encode(['message' => 'Database error: Unable to save post.']);
                    }
                }
            } else {
                echo json_encode(['message' => 'Error uploading the file.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['message' => 'Invalid request. Missing user ID, description, or file.']);
    }
} else {
    echo json_encode(['message' => 'Invalid request method.']);
}
?>
