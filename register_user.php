<?php
require 'db.php';

$name = $_POST['name'];
$gender = $_POST['gender'];
$imageData = $_POST['imageData'];

$imagePath = 'uploads/' . time() . '.png';
file_put_contents($imagePath, file_get_contents($imageData));

$stmt = $pdo->prepare("INSERT INTO users (name, gender, image_path) VALUES (?, ?, ?)");
$stmt->execute([$name, $gender, $imagePath]);

echo "Pendaftaran berhasil. <a href='index.html'>Kembali</a>";
?>
