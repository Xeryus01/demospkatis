<?php
require 'db.php';

header('Content-Type: application/json');

try {
    // Mengambil data pengguna dari database
    $stmt = $pdo->query("SELECT name, image_path FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Mengembalikan data pengguna dalam format JSON
    echo json_encode($users);
    
} catch (Exception $e) {
    // Menangani kesalahan saat mengambil data
    echo json_encode([]);
}
?>