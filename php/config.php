<?php
$host = '176.53.163.205';
$port = '5432';
$dbname = 'EXAMPLE';
$user = 'EXAMPLE';
$password = 'EXAMPLE';

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Подключение к pg не удалось:" . $e->getMessage());
}
?>