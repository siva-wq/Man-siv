<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/db.php';
$db = (new Database())->getConnection();

if (isset($_GET['user_id']) && isset($_GET['post_id'])) {
    $user_id = $_GET['user_id'];
    $post_id = $_GET['post_id'];

    try {
        
        $query = $db->prepare("SELECT * FROM likes WHERE user_id = :user_id AND post_id = :post_id");
        $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $query->bindParam(':post_id', $post_id, PDO::PARAM_INT);
        $query->execute();
        $follow=false;
        // Check if the user is following
        if ($query->rowCount() > 0) {

            echo json_encode(["message" => "User is like the post.", "status" => !$follow]);
        } else {
            echo json_encode(["message" => "User is not like the post.", "status" => $follow]);
        }
    } catch (PDOException $e) {
        echo json_encode(["message" => "Error: " . $e->getMessage(), "status" => "error"]);
    }
} else {
    echo json_encode(["message" => "Missing parameters.", "status" => "error"]);
}
?>
