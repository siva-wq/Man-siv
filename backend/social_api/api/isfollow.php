<?php
// Include the database connection
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/db.php';
$db = (new Database())->getConnection();

// Check if the required parameters are passed
if (isset($_GET['user_id']) && isset($_GET['follower_id'])) {
    $user_id = $_GET['user_id'];
    $follower_id = $_GET['follower_id'];

    try {
        // Prepare SQL query to check if the user is following
        $query = $db->prepare("SELECT * FROM follows WHERE user_id = :user_id AND follower_id = :follower_id");
        $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $query->bindParam(':follower_id', $follower_id, PDO::PARAM_INT);
        $query->execute();
        $follow=false;
        // Check if the user is following
        if ($query->rowCount() > 0) {

            echo json_encode(["message" => "User is following.", "status" => !$follow]);
        } else {
            echo json_encode(["message" => "User is not following.", "status" => $follow]);
        }
    } catch (PDOException $e) {
        echo json_encode(["message" => "Error: " . $e->getMessage(), "status" => "error"]);
    }
} else {
    echo json_encode(["message" => "Missing parameters.", "status" => "error"]);
}
?>
