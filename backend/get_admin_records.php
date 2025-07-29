<?php
// backend/get_admin_records.php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $employeeId = (int)($input['employee_id'] ?? 0);
    $startDate = $input['start_date'] ?? null; // YYYY-MM-DD
    $endDate = $input['end_date'] ?? null;     // YYYY-MM-DD
    $pointType = $input['point_type'] ?? null;

    try {
        $sql = "
            SELECT r.id, r.user_id, r.type, r.timestamp, r.photo_path, u.name as userName
            FROM records r
            JOIN users u ON r.user_id = u.id
            WHERE 1=1
        ";
        $params = [];

        if ($employeeId) {
            $sql .= " AND r.user_id = ?";
            $params[] = $employeeId;
        }

        if ($startDate) {
            $sql .= " AND DATE(r.timestamp) >= ?";
            $params[] = $startDate;
        }

        if ($endDate) {
            $sql .= " AND DATE(r.timestamp) <= ?";
            $params[] = $endDate;
        }

        if ($pointType) {
            $sql .= " AND r.type = ?";
            $params[] = $pointType;
        }

        $sql .= " ORDER BY r.timestamp DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        // Formatar timestamps
        foreach ($records as &$record) {
            $record['timestamp'] = formatTimestampToBR($record['timestamp']);
        }

        echo json_encode(['success' => true, 'records' => $records]);
    } catch (PDOException $e) {
        error_log("Erro ao buscar registros admin: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro ao consultar o banco de dados.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>