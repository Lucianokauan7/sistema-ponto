<?php
// backend/config.php

// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'safeguardian_db');
define('DB_USER', 'root'); // Usuário padrão do XAMPP
define('DB_PASS', '');     // Senha padrão do XAMPP (vazia)

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Em produção, registre o erro em um log e mostre uma mensagem genérica
    die("Erro na conexão com o banco de dados: " . $e->getMessage());
}

// Função para formatar timestamp do MySQL (YYYY-MM-DD HH:MM:SS) para DD/MM/YYYY HH:MM:SS
function formatTimestampToBR($mysqlTimestamp) {
    $datetime = new DateTime($mysqlTimestamp);
    return $datetime->format('d/m/Y H:i:s');
}

// Função para converter timestamp BR (DD/MM/YYYY HH:MM:SS) para MySQL (YYYY-MM-DD HH:MM:SS)
function formatBRToMySQLTimestamp($brTimestamp) {
    $datetime = DateTime::createFromFormat('d/m/Y H:i:s', $brTimestamp);
    if (!$datetime) {
        throw new Exception("Formato de data inválido: $brTimestamp");
    }
    return $datetime->format('Y-m-d H:i:s');
}

?>