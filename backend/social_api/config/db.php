<?php
class Database {
   /* private $host = "sql200.infinityfree.com";
    private $db_name = "if0_39065318_mansiv";
    private $username = "if0_39065318";
    private $password = "2W4mYU5mHHp4Io";*/
    private $host = "sql310.ezyro.com";
     private $db_name = "ezyro_39089839_ManSiv";
     private $username = "ezyro_39089839";
     private $password = "f3bfb1ea226";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
           
        } catch (PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
?>
