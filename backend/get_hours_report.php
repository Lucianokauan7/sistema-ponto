<?php
// backend/get_hours_report.php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $employeeId = (int)($input['employee_id'] ?? 0);
    $startDate = $input['start_date'] ?? null; // YYYY-MM-DD
    $endDate = $input['end_date'] ?? null;     // YYYY-MM-DD

    try {
        $sql = "
            SELECT r.user_id, u.name as userName, DATE(r.timestamp) as work_date,
                   r.type, r.timestamp
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

        $sql .= " ORDER BY r.user_id, r.timestamp";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rawRecords = $stmt->fetchAll();

        // Processar registros para calcular horas
        $reportData = [];
        $currentUser = null;
        $currentUserId = null;
        $dailyRecords = [];

        foreach ($rawRecords as $record) {
            $userId = $record['user_id'];
            $userName = $record['userName'];
            $workDate = $record['work_date'];
            $type = $record['type'];
            $timestamp = new DateTime($record['timestamp']);

            // Se mudou de usuário, processe os dados do anterior
            if ($currentUserId !== null && $currentUserId != $userId) {
                $totalSeconds = calculateTotalSecondsForUser($dailyRecords);
                if ($totalSeconds > 0) {
                    if (!isset($reportData[$currentUserId])) {
                        $reportData[$currentUserId] = [
                            'employeeId' => $currentUserId,
                            'employeeName' => $userName, // Usar o nome do primeiro registro do usuário
                            'totalSeconds' => 0
                        ];
                    }
                    $reportData[$currentUserId]['totalSeconds'] += $totalSeconds;
                }
                $dailyRecords = []; // Resetar para o novo usuário
            }

            $currentUser = $userName;
            $currentUserId = $userId;

            // Agrupar por dia
            if (!isset($dailyRecords[$workDate])) {
                $dailyRecords[$workDate] = [];
            }
            $dailyRecords[$workDate][] = ['type' => $type, 'timestamp' => $timestamp];
        }

        // Processar o último usuário
        if ($currentUserId !== null && !empty($dailyRecords)) {
            $totalSeconds = calculateTotalSecondsForUser($dailyRecords);
            if ($totalSeconds > 0) {
                if (!isset($reportData[$currentUserId])) {
                    $reportData[$currentUserId] = [
                        'employeeId' => $currentUserId,
                        'employeeName' => $currentUser,
                        'totalSeconds' => 0
                    ];
                }
                $reportData[$currentUserId]['totalSeconds'] += $totalSeconds;
            }
        }

        // Converter array associativo em array indexado
        $finalReport = array_values($reportData);

        echo json_encode(['success' => true, 'report' => $finalReport]);
    } catch (PDOException $e) {
        error_log("Erro ao gerar relatório: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro ao consultar o banco de dados.']);
    } catch (Exception $e) {
        error_log("Erro ao calcular horas: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro ao calcular horas trabalhadas.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

function calculateTotalSecondsForUser($dailyRecords) {
    $totalSeconds = 0;
    foreach ($dailyRecords as $date => $records) {
        // Ordenar registros do dia por hora
        usort($records, function($a, $b) {
            return $a['timestamp'] <=> $b['timestamp'];
        });

        $entrada = null;
        $intervalo = null;
        $retorno = null;

        foreach ($records as $record) {
            $type = $record['type'];
            $timestamp = $record['timestamp'];

            if ($type === 'entrada') {
                $entrada = $timestamp;
            } elseif ($type === 'intervalo' && $entrada) {
                $totalSeconds += ($timestamp->getTimestamp() - $entrada->getTimestamp());
                $intervalo = $timestamp;
            } elseif ($type === 'retorno' && $intervalo) {
                $retorno = $timestamp;
            } elseif ($type === 'saida' && ($entrada || $retorno)) {
                $start = $retorno ?? $entrada;
                $totalSeconds += ($timestamp->getTimestamp() - $start->getTimestamp());
            }
        }
    }
    return $totalSeconds;
}
?>
