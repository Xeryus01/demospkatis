<?php
require 'db.php';

// Pengambilan data POST dari form input
$name = $_POST['name'];
$stmt = $pdo->prepare("SELECT id FROM users WHERE name = ?");
$stmt->execute([$name]);
$user = $stmt->fetch();

// Menyimpan data absensi ke database
if ($user) {
    $stmt = $pdo->prepare("INSERT INTO attendance (user_id) VALUES (?)");
    $stmt->execute([$user['id']]);
}
?>
