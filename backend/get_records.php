<?php
// backend/get_records.php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = (int)($_GET['user_id'] ?? 0);

    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'ID do usuário é obrigatório.']);
        exit;
    }

    try {
        // Buscar registros do usuário
        $stmt = $pdo->prepare("
            SELECT r.id, r.user_id, r.type, r.timestamp, r.photo_path, u.name as userName
            FROM records r
            JOIN users u ON r.user_id = u.id
            WHERE r.user_id = ?
            ORDER BY r.timestamp DESC
        ");
        $stmt->execute([$userId]);
        $records = $stmt->fetchAll();

        // Formatar timestamps
        foreach ($records as &$record) {
            $record['timestamp'] = formatTimestampToBR($record['timestamp']);
        }

        echo json_encode(['success' => true, 'records' => $records]);
    } catch (PDOException $e) {
        error_log("Erro ao buscar registros: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro ao consultar o banco de dados.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>