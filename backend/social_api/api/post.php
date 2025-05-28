<?php
// Allow all origins (for development purposes, adjust as needed for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS request (required for CORS pre-flight check)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data['user_id'];
    $content = $data['content'];
    $image = $data['image'];

    $query = "INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);

    if ($stmt->execute([$user_id, $content, $image])) {
        echo json_encode(["message" => "Post created successfully"]);
    } else {
        echo json_encode(["message" => "Failed to create post"]);
    }
}
?>
<?php
include_once '../config/db.php';
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC";
    $stmt = $db->query($query);

    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($posts);
}
?>

