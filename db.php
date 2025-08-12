<?php
try {

    // Membuat koneksi ke database MySQL
    $pdo = new PDO("mysql:host=localhost;dbname=demospkatis", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {

    // Menangani kesalahan koneksi
    die("Koneksi database gagal: " . $e->getMessage());
}
?>