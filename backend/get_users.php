<?php
// backend/get_users.php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = (int)($_GET['id'] ?? 0); // Para editar um usuário específico

    try {
        if ($userId) {
            // Buscar um usuário específico
            $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $users = $stmt->fetchAll(); // Retorna um array mesmo para um único usuário
        } else {
            // Buscar todos os usuários
            $stmt = $pdo->query("SELECT id, name, email, role FROM users ORDER BY name");
            $users = $stmt->fetchAll();
        }

        echo json_encode(['success' => true, 'users' => $users]);
    } catch (PDOException $e) {
        error_log("Erro ao buscar usuários: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro ao consultar o banco de dados.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>