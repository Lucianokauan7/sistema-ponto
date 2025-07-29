<?php
// backend/save_user.php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Captura os dados do formulário
    $name     = trim($_POST['user-name'] ?? '');
    $email    = trim($_POST['user-email'] ?? '');
    $password = $_POST['user-password'] ?? '';
    $role     = $_POST['user-role'] ?? '';

    // Validações básicas
    if (empty($name) || empty($email) || empty($password) || empty($role)) {
        header("Location: ../index.php?error=Todos os campos são obrigatórios.");
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../index.php?error=Email inválido.");
        exit;
    }

    if (!in_array($role, ['employee', 'admin'])) {
        header("Location: ../index.php?error=Perfil inválido.");
        exit;
    }

    try {
        // Verifica se o email já existe
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->fetch()) {
            header("Location: ../index.php?error=Este email já está cadastrado.");
            exit;
        }

        // Criptografa a senha
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insere o novo usuário
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $hashedPassword, $role]);

        header("Location: ../index.php?success=Usuário criado com sucesso.");
    } catch (PDOException $e) {
        error_log("Erro ao inserir usuário: " . $e->getMessage());
        header("Location: ../index.php?error=Erro ao salvar usuário.");
    }
} else {
    header("Location: ../index.php?error=Método não permitido.");
}
