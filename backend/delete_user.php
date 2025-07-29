<?php
// backend/delete_user.php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID do usuário é obrigatório.']);
        exit;
    }

    // Impedir a exclusão do próprio usuário logado (se estiver usando sessão)
    // session_start();
    // if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $id) {
    //     echo json_encode(['success' => false, 'message' => 'Você não pode excluir sua própria conta.']);
    //     exit;
    // }

    try {
        // A exclusão em cascata (ON DELETE CASCADE) na tabela records já limpará os registros do usuário
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Usuário excluído com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        }
    } catch (PDOException $e) {
        error_log("Erro ao excluir usuário: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir usuário do banco de dados.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>