<?php
include_once '../config/db.php';

$sql = "CREATE TABLE IF NOT EXISTS user_status (
    user_id INT PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Table user_status created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
