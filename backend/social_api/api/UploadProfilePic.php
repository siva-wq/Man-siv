<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php';


$uploadDir="PATH"; 
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true); 
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['profile_pic']) && isset($_POST['user_id'])) {
        $userId = intval($_POST['user_id']); 
        $fileTmpPath = $_FILES['profile_pic']['tmp_name'];
        $fileExtension = pathinfo($_FILES['profile_pic']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('profile_', true) . '.' . $fileExtension; 
        $targetFilePath = $uploadDir . $fileName;

       
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array(strtolower($fileExtension), $allowedExtensions)) {
            http_response_code(400); 
            echo json_encode(['message' => 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.']);
            exit;
        }

        
        try {
            $pdo = (new Database())->getConnection();
        } catch (PDOException $e) {
            http_response_code(500); 
            echo json_encode(['message' => 'Database connection error.']);
            exit;
        }

        
        try {
            $stmt = $pdo->prepare("SELECT profile_pic_url FROM profile_pics WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            
            if (move_uploaded_file($fileTmpPath, $targetFilePath)) {
                $fileUrl = $uploadDir . $fileName;

                if ($user) {
                    
                    $stmt = $pdo->prepare("
                        UPDATE profile_pics 
                        SET profile_pic_url = :profile_pic_url 
                        WHERE user_id = :user_id
                    ");
                    $stmt->bindParam(':profile_pic_url', $fileUrl, PDO::PARAM_STR);
                    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);

                    if ($stmt->execute()) {
                        http_response_code(200); 
                        echo json_encode(['message' => 'Profile picture updated successfully.', 'url' => $fileUrl]);
                    } else {
                        http_response_code(500); 
                        echo json_encode(['message' => 'Database error: Unable to update profile picture.']);
                    }
                } else {
                    
                    $stmt = $pdo->prepare("
                        INSERT INTO profile_pics (user_id, profile_pic_url) 
                        VALUES (:user_id, :profile_pic_url)
                    ");
                    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $stmt->bindParam(':profile_pic_url', $fileUrl, PDO::PARAM_STR);

                    if ($stmt->execute()) {
                        http_response_code(201); 
                        echo json_encode(['message' => 'Profile picture uploaded and URL saved successfully.', 'url' => $fileUrl]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['message' => 'Database error: Unable to save profile picture.']);
                    }
                }
            } else {
                http_response_code(500); 
                echo json_encode(['message' => 'Error uploading the file.']);
            }
        } catch (PDOException $e) {
            http_response_code(500); 
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid request. Missing user ID or profile picture.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['message' => 'Invalid request method.']);
}
?>
