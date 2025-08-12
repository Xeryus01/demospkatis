<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $imageData = $_POST['imageData'] ?? '';

    if ($name && $gender && $imageData) {
        $targetDir = 'uploads/';
        if (!is_dir($targetDir)) mkdir($targetDir);

        $filename = uniqid() . '.png';
        $targetFile = $targetDir . $filename;

        // Simpan gambar dari base64
        $img = str_replace('data:image/png;base64,', '', $imageData);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);

        if (file_put_contents($targetFile, $data)) {
            $stmt = $pdo->prepare("INSERT INTO users (name, gender, image_path) VALUES (?, ?, ?)");
            if ($stmt->execute([$name, $gender, $targetFile])) {
                // Tampilkan hasil pendaftaran
                echo '<div style="max-width:400px;margin:40px auto;background:#fff;padding:32px 24px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;">';
                echo '<h3 style="color:#007bff;margin-bottom:16px;">Registrasi Berhasil</h3>';
                echo '<img src="'.$targetFile.'" alt="Foto Wajah" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:16px;">';
                echo '<div style="font-size:1.1em;margin-bottom:8px;"><strong>Nama:</strong> '.htmlspecialchars($name).'</div>';
                echo '<div style="margin-bottom:16px;"><strong>Jenis Kelamin:</strong> '.htmlspecialchars($gender).'</div>';
                echo '<a href="index.html" style="padding:10px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;display:inline-block;">Ke Absensi</a>';
                echo '</div>';
                exit;
            } else {
                $error = 'Gagal menyimpan ke database.';
            }
        } else {
            $error = 'Gagal menyimpan gambar.';
        }
    } else {
        $error = 'Data tidak lengkap.';
    }
}

// Jika gagal, tampilkan pesan error
if (isset($error)) {
    echo '<div style="max-width:400px;margin:40px auto;background:#fff;padding:32px 24px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;">';
    echo '<h3 style="color:#dc3545;margin-bottom:16px;">Registrasi Gagal</h3>';
    echo '<div style="margin-bottom:16px;">'.htmlspecialchars($error).'</div>';
    echo '<a href="register.html" style="padding:10px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;display:inline-block;">Coba Lagi</a>';
    echo '</div>';
}
?>