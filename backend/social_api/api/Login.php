<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $email = $data['email'];
    $password = $data['password'];  

    =
    $query = "SELECT * FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        
        if (password_verify($password, $user['password'])) {
            echo json_encode(["message" => "Login successful", "user_id" => $user['id']]);
        } else {
            echo json_encode(["message" => "Invalid email or password"]);
        }
    } else {
        echo json_encode(["message" => "Invalid email or password"]);
    }
}
?>
