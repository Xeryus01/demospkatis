<?php
require 'db.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $imageData = $_POST['image'] ?? '';

    if ($name && $imageData) {
        $targetDir = 'uploads/';
        if (!is_dir($targetDir)) mkdir($targetDir);

        $filename = uniqid() . '.png';
        $targetFile = $targetDir . $filename;

        // Decode base64 image
        $img = str_replace('data:image/png;base64,', '', $imageData);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);

        if (file_put_contents($targetFile, $data)) {
            $stmt = $pdo->prepare("INSERT INTO users (name, image_path) VALUES (?, ?)");
            if ($stmt->execute([$name, $targetFile])) {
                $response['success'] = true;
            } else {
                $response['message'] = 'Gagal menyimpan ke database.';
            }
        } else {
            $response['message'] = 'Gagal menyimpan gambar.';
        }
    } else {
        $response['message'] = 'Data tidak lengkap.';
    }
} else {
    $response['message'] = 'Metode tidak valid.';
}

header('Content-Type: application/json');
echo json_encode($response);
?>