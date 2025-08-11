<?php
require 'db.php';

$name = $_POST['name'];
$stmt = $pdo->prepare("SELECT id FROM users WHERE name = ?");
$stmt->execute([$name]);
$user = $stmt->fetch();

if ($user) {
    $stmt = $pdo->prepare("INSERT INTO attendance (user_id) VALUES (?)");
    $stmt->execute([$user['id']]);
}
?>
