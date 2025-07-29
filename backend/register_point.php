<?php
// backend/register_point.php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $userId = (int)($input['userId'] ?? 0);
    $type = $input['type'] ?? null;
    $timestamp = $input['timestamp'] ?? null; // Formato DD/MM/YYYY HH:MM:SS
    $photoData = $input['photo'] ?? null; // Data URL

    if (!$userId || !$type || !$timestamp || !$photoData) {
        echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
        exit;
    }

    // Validar tipo de ponto
    $validTypes = ['entrada', 'intervalo', 'retorno', 'saida'];
    if (!in_array($type, $validTypes)) {
        echo json_encode(['success' => false, 'message' => 'Tipo de ponto inválido.']);
        exit;
    }

    try {
        // Converter timestamp BR para MySQL
        $mysqlTimestamp = formatBRToMySQLTimestamp($timestamp);

        // Salvar a foto
        $uploadDir = '../uploads/'; // Caminho relativo da pasta backend para uploads
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Extrair dados da imagem base64
        if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $typeMatch)) {
            $imageData = substr($photoData, strpos($photoData, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData === false) {
                throw new Exception('Decodificação base64 falhou.');
            }

            // Gerar nome único para o arquivo
            $fileExtension = strtolower($typeMatch[1]);
            // Garantir que a extensão seja jpg, png ou gif
            if (!in_array($fileExtension, ['jpeg', 'jpg', 'png', 'gif'])) {
                 $fileExtension = 'jpg'; // Padrão
            }
            $fileName = 'photo_' . $userId . '_' . time() . '_' . bin2hex(random_bytes(5)) . '.' . $fileExtension;
            $filePath = $uploadDir . $fileName;
            $relativePath = 'uploads/' . $fileName; // Caminho relativo para salvar no DB

            if (file_put_contents($filePath, $imageData)) {
                // Inserir registro no banco
                $stmt = $pdo->prepare("
                    INSERT INTO records (user_id, type, timestamp, photo_path)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([$userId, $type, $mysqlTimestamp, $relativePath]);

                echo json_encode([
                    'success' => true,
                    'message' => 'Ponto registrado com sucesso.',
                    'recordId' => $pdo->lastInsertId(),
                    'photoUrl' => $relativePath // Retornar caminho relativo
                ]);
            } else {
                throw new Exception('Falha ao salvar a imagem.');
            }
        } else {
            throw new Exception('Formato de imagem inválido.');
        }
    } catch (Exception $e) {
        error_log("Erro ao registrar ponto: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>