<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


include_once '../config/db.php';
$db = (new Database())->getConnection();

$user_id = $_GET['user_id'];

$stmt = $db->prepare("SELECT COUNT(*) AS follower_count FROM follows WHERE user_id = :user_id");
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

$stmt1 = $db->prepare("SELECT COUNT(*) AS following_count FROM follows WHERE follower_id = :user_id");
$stmt1->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt1->execute();
$result1 = $stmt1->fetch(PDO::FETCH_ASSOC);
echo json_encode(['follower_count' => $result['follower_count'],"following_count"=>$result1['following_count']]);
?>
