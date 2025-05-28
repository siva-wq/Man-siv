<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['user_id'], $data['follower_id'], $data['follow'])) {
        $user_id = intval($data['user_id']);
        $follower_id = intval($data['follower_id']);
        $follow = boolval($data['follow']);

        try {
            if ($user_id == $follower_id) {
                echo json_encode(["message" => "Cannot follow yourself", "status" => "error"]);
                exit();
            }

            // Toggle follow/unfollow
            if ($follow) {
                $sql = "INSERT IGNORE INTO follows (user_id, follower_id) VALUES (?, ?)";
            } else {
                $sql = "DELETE FROM follows WHERE user_id = ? AND follower_id = ?";
            }
            $stmt = $db->prepare($sql);
            $stmt->bindParam(1, $user_id, PDO::PARAM_INT);
            $stmt->bindParam(2, $follower_id, PDO::PARAM_INT);
            $stmt->execute();

            // Get the number of followers
            $stmt2 = $db->prepare("SELECT COUNT(*) AS follower_count FROM follows WHERE user_id = :user_id");
            $stmt2->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt2->execute();
            $result = $stmt2->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "message" => "Follow toggled successfully",
                "id"=>$user_id,
                "status" => "success",
                "follower_count" => $result['follower_count'] ?? 0,
                
            ]);
        } catch (PDOException $e) {
            echo json_encode(["message" => "SQL Error: " . $e->getMessage(), "status" => "error"]);
        }
    } else {
        echo json_encode(["message" => "Invalid request payload", "status" => "error"]);
    }
} else {
    echo json_encode(["message" => "Invalid request method", "status" => "error"]);
}
?>
