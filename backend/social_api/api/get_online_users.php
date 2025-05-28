<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once '../config/db.php';
$db = (new Database())->getConnection();

$sql = "SELECT user_id, is_online, last_active 
        FROM user_status 
        WHERE is_online = 1 
        AND last_active >= NOW() - INTERVAL 2 MINUTE";

$result = $db->query($sql);
$online_users = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $online_users[$row['user_id']] = true;
    }
}

echo json_encode($online_users);

$db->close();
?>
