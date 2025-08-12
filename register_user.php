<?php
require 'db.php';

// Pengambilan data POST dari form input
$name = $_POST['name'];
$gender = $_POST['gender'];
$imageData = $_POST['imageData'];

// Menentukan path untuk menyimpan gambar
$imagePath = 'uploads/' . time() . '.png';

// Menyimpan gambar dengan base64
$img = str_replace('data:image/png;base64,', '', $imageData);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
file_put_contents($imagePath, $data);

// Menyimpan data ke database
$stmt = $pdo->prepare("INSERT INTO users (name, gender, image_path) VALUES (?, ?, ?)");
$stmt->execute([$name, $gender, $imagePath]);
?>

<!-- HTML (user interface) untuk menampilkan hasil registrasi -->
<!DOCTYPE html>
<html>
<head>
    <title>Registrasi Berhasil</title>
    <style>
        body {
            background: #f4f6fa;
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .result-container {
            max-width: 500px;
            margin: 60px auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 32px 24px;
            display: flex;
            align-items: center;
            gap: 32px;
        }
        .result-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        .result-info {
            flex: 1;
            text-align: left;
        }
        .result-info h3 {
            color: #007bff;
            margin-bottom: 12px;
        }
        .result-info div {
            margin-bottom: 8px;
            font-size: 1.1em;
        }
        .btn-absensi {
            display: inline-block;
            margin-top: 16px;
            padding: 10px 24px;
            background: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.2s;
        }
        .btn-absensi:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="result-container">
        <img src="<?php echo $imagePath; ?>" alt="Foto Wajah" class="result-photo">
        <div class="result-info">
            <h3>Registrasi Berhasil</h3>
            <div><strong>Nama:</strong> <?php echo htmlspecialchars($name); ?></div>
            <div><strong>Jenis Kelamin:</strong> <?php echo htmlspecialchars($gender); ?></div>
            <a href="index.html" class="btn-absensi">Ke Absensi</a>
        </div>
    </div>
</body>
</html>