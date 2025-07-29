// js/main.js

// Mock data (será substituído pelas chamadas ao backend)
let mockUsers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@guardian.com",
    password: "123456", // Em produção, NUNCA armazene senhas em texto plano!
    role: "employee",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@guardian.com",
    password: "123456",
    role: "employee",
  },
  {
    id: 3,
    name: "Pedro Almeida",
    email: "pedro@guardian.com",
    password: "123456",
    role: "employee",
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@guardian.com",
    password: "admin123",
    role: "admin",
  },
];
// Atualizando os timestamps para o formato DD/MM/YYYY HH:MM:SS
let mockRecords = [
  {
    id: 1,
    userId: 1,
    userName: "João Silva",
    type: "entrada",
    timestamp: "15/01/2024 08:00:00",
    photo: "https://placehold.co/100x60/10b981/FFFFFF?text=Entrada",
  },
  {
    id: 2,
    userId: 1,
    userName: "João Silva",
    type: "intervalo",
    timestamp: "15/01/2024 12:00:00",
    photo: "https://placehold.co/100x60/f59e0b/FFFFFF?text=Pausa",
  },
  {
    id: 3,
    userId: 2,
    userName: "Maria Santos",
    type: "entrada",
    timestamp: "15/01/2024 07:55:00",
    photo: "https://placehold.co/100x60/10b981/FFFFFF?text=Entrada",
  },
  {
    id: 4,
    userId: 1,
    userName: "João Silva",
    type: "retorno",
    timestamp: "15/01/2024 13:00:00",
    photo: "https://placehold.co/100x60/f97316/FFFFFF?text=Retorno",
  },
  {
    id: 5,
    userId: 1,
    userName: "João Silva",
    type: "saida",
    timestamp: "15/01/2024 18:00:00",
    photo: "https://placehold.co/100x60/ef4444/FFFFFF?text=Saída",
  },
  {
    id: 6,
    userId: 2,
    userName: "Maria Santos",
    type: "intervalo",
    timestamp: "15/01/2024 12:15:00",
    photo: "https://placehold.co/100x60/f59e0b/FFFFFF?text=Pausa",
  },
  {
    id: 7,
    userId: 2,
    userName: "Maria Santos",
    type: "retorno",
    timestamp: "15/01/2024 13:15:00",
    photo: "https://placehold.co/100x60/f97316/FFFFFF?text=Retorno",
  },
  {
    id: 8,
    userId: 2,
    userName: "Maria Santos",
    type: "saida",
    timestamp: "15/01/2024 17:45:00",
    photo: "https://placehold.co/100x60/ef4444/FFFFFF?text=Saída",
  },
  {
    id: 9,
    userId: 1,
    userName: "João Silva",
    type: "entrada",
    timestamp: "16/01/2024 08:10:00",
    photo: "https://placehold.co/100x60/10b981/FFFFFF?text=Entrada",
  },
  {
    id: 10,
    userId: 1,
    userName: "João Silva",
    type: "saida",
    timestamp: "16/01/2024 17:55:00",
    photo: "https://placehold.co/100x60/ef4444/FFFFFF?text=Saída",
  },
  {
    id: 11,
    userId: 3,
    userName: "Pedro Almeida",
    type: "entrada",
    timestamp: "16/01/2024 07:45:00",
    photo: "https://placehold.co/100x60/10b981/FFFFFF?text=Entrada",
  },
  {
    id: 12,
    userId: 3,
    userName: "Pedro Almeida",
    type: "saida",
    timestamp: "16/01/2024 18:10:00",
    photo: "https://placehold.co/100x60/ef4444/FFFFFF?text=Saída",
  },
];
let currentUser = null;
let cameraStream = null;
let capturedImage = null; // Armazena a imagem capturada temporariamente
let selectedPointType = "entrada";
let registeredPoints = [];
let currentTab = "records";
let filteredRecords = [];
// DOM Elements
let loginView, employeeView, adminView;
let loginForm, logoutBtn, adminLogoutBtn;
let registerPointBtn, confirmPointBtn, retryBtn; // Adicionado confirmPointBtn
let cameraVideo, cameraCanvas, cameraPlaceholder, capturedImageEl;
let recordsList, adminRecordsTable, usersList, usersTable;
let welcomeMessage, recordsCount, modalPhoto;
// Form elements
let userForm, userIdInput, userNameInput, userEmailInput, userPasswordInput, userRoleInput;
let userModalTitle, saveUserBtn;
// Filter elements
let filterEmployee, filterStartDate, filterEndDate, filterPointType;
let applyFiltersBtn, exportCsvBtn, exportXmlBtn;
// Report elements
let reportStartDate, reportEndDate, reportEmployeeFilter, applyReportFiltersBtn, hoursReportTable;
let exportHoursCsvBtn, exportHoursXmlBtn;
// Tab navigation
let tabButtons, tabContents, pointTypeButtons;

// Mensagem de confirmação
let confirmationMessage;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Associar elementos do DOM
    initializeDOMElements();
    // Associar event listeners
    initializeEventListeners();
    // Iniciar visualização
    showView("login");
});

function initializeDOMElements() {
    loginView = document.getElementById("login-view");
    employeeView = document.getElementById("employee-view");
    adminView = document.getElementById("admin-view");
    loginForm = document.getElementById("login-form");
    logoutBtn = document.getElementById("logout-btn");
    adminLogoutBtn = document.getElementById("admin-logout-btn");
    registerPointBtn = document.getElementById("register-point-btn");
    confirmPointBtn = document.getElementById("confirm-point-btn"); // Novo botão
    retryBtn = document.getElementById("retry-btn");
    cameraVideo = document.getElementById("camera-video");
    cameraCanvas = document.getElementById("camera-canvas");
    cameraPlaceholder = document.getElementById("camera-placeholder");
    capturedImageEl = document.getElementById("captured-image");
    recordsList = document.getElementById("records-list");
    adminRecordsTable = document.getElementById("admin-records-table");
    usersList = document.getElementById("users-list-sidebar");
    usersTable = document.getElementById("users-table");
    welcomeMessage = document.getElementById("welcome-message");
    recordsCount = document.getElementById("records-count");
    modalPhoto = document.getElementById("modal-photo");
    // Form elements
    userForm = document.getElementById("user-form");
    userIdInput = document.getElementById("user-id");
    userNameInput = document.getElementById("user-name");
    userEmailInput = document.getElementById("user-email");
    userPasswordInput = document.getElementById("user-password");
    userRoleInput = document.getElementById("user-role");
    userModalTitle = document.getElementById("userModalTitle");
    saveUserBtn = document.getElementById("save-user-btn");
    // Filter elements
    filterEmployee = document.getElementById("filter-employee");
    filterStartDate = document.getElementById("filter-start-date");
    filterEndDate = document.getElementById("filter-end-date");
    filterPointType = document.getElementById("filter-point-type");
    applyFiltersBtn = document.getElementById("apply-filters-btn");
    exportCsvBtn = document.getElementById("export-csv-btn");
    exportXmlBtn = document.getElementById("export-xml-btn");
    // Report elements
    reportStartDate = document.getElementById("report-start-date");
    reportEndDate = document.getElementById("report-end-date");
    reportEmployeeFilter = document.getElementById("report-employee-filter");
    applyReportFiltersBtn = document.getElementById("apply-report-filters-btn");
    hoursReportTable = document.getElementById("hours-report-table");
    exportHoursCsvBtn = document.getElementById("export-hours-csv-btn");
    exportHoursXmlBtn = document.getElementById("export-hours-xml-btn");
    // Tab navigation
    tabButtons = document.querySelectorAll("[data-tab]");
    tabContents = document.querySelectorAll(".tab-content");
    // Point type buttons
    pointTypeButtons = document.querySelectorAll(".point-type-btn");
    confirmationMessage = document.getElementById("confirmation-message"); // Nova mensagem
    
    // Adicionar listener para o link de esqueceu a senha
    document.getElementById("forgot-password-link").addEventListener("click", function(e) {
        e.preventDefault();
        alert("Para recuperar sua senha, entre em contato com o administrador do sistema.");
    });
}

function initializeEventListeners() {
    loginForm.addEventListener("submit", handleLogin);
    logoutBtn.addEventListener("click", handleLogout);
    adminLogoutBtn.addEventListener("click", handleLogout);
    registerPointBtn.addEventListener("click", handleRegisterPoint);
    confirmPointBtn.addEventListener("click", handleConfirmPoint); // Listener para o novo botão
    retryBtn.addEventListener("click", handleRetry);
    saveUserBtn.addEventListener("click", saveUser);
    applyFiltersBtn.addEventListener("click", applyFilters);
    exportCsvBtn.addEventListener("click", exportToCSV);
    exportXmlBtn.addEventListener("click", exportToXML);
    // Report event listeners
    applyReportFiltersBtn.addEventListener("click", loadHoursReport);
    exportHoursCsvBtn.addEventListener("click", exportHoursToCSV);
    exportHoursXmlBtn.addEventListener("click", exportHoursToXML);
    
    // Tab navigation
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentTab = btn.dataset.tab;
            showTab(currentTab);
            // Carregar relatório quando a aba for aberta
            if (currentTab === "reports") {
                populateReportEmployeeFilter();
                loadHoursReport();
            }
        });
    });
    
    // Point type selection
    pointTypeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            pointTypeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedPointType = btn.dataset.type;
            resetCameraState(); // Resetar ao mudar o tipo de ponto
        });
    });
    
    // Modal events
    document
        .getElementById("userModal")
        .addEventListener("hidden.bs.modal", resetUserForm);
}

// Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const user = mockUsers.find(
        (u) => u.email === email && u.password === password
    );
    if (user) {
        currentUser = user;
        registeredPoints = [];
        showView(user.role === "admin" ? "admin" : "employee");
        if (user.role === "employee") {
            showEmployeeView();
        } else {
            showAdminView();
        }
    } else {
        alert("Credenciais inválidas");
    }
}
function handleLogout() {
    currentUser = null;
    stopCamera();
    capturedImage = null;
    registeredPoints = [];
    showView("login");
}
function showView(view) {
    loginView.classList.add("d-none");
    employeeView.classList.add("d-none");
    adminView.classList.add("d-none");
    if (view === "employee") {
        employeeView.classList.remove("d-none");
    } else if (view === "admin") {
        adminView.classList.remove("d-none");
    } else {
        loginView.classList.remove("d-none");
    }
}
function showEmployeeView() {
    welcomeMessage.textContent = `Bem-vindo, ${currentUser.name}`;
    loadEmployeeRecords();
    resetCameraState();
}
function showAdminView() {
    populateEmployeeFilter();
    loadAdminRecords();
    loadUsersList();
    loadUsersTable();
    showTab("records");
}
function showTab(tabName) {
    tabContents.forEach((tab) => tab.classList.add("d-none"));
    document.getElementById(`${tabName}-tab`).classList.remove("d-none");
    if (tabName === "records") {
        loadAdminRecords();
    } else if (tabName === "users") {
        loadUsersTable();
    } else if (tabName === "reports") {
        populateReportEmployeeFilter();
        loadHoursReport();
    }
}
function populateEmployeeFilter() {
    filterEmployee.innerHTML = '<option value="">Todos</option>';
    const employees = mockUsers.filter((u) => u.role === "employee");
    employees.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        filterEmployee.appendChild(option);
    });
}
// Preencher filtro de funcionários no relatório
function populateReportEmployeeFilter() {
    reportEmployeeFilter.innerHTML = '<option value="">Todos os funcionários</option>';
    const employees = mockUsers.filter((u) => u.role === "employee");
    employees.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        reportEmployeeFilter.appendChild(option);
    });
}
async function startCamera() {
    try {
        stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
        });
        cameraVideo.srcObject = cameraStream;
        cameraVideo.classList.remove("d-none");
        cameraPlaceholder.classList.add("d-none");
        capturedImageEl.classList.add("d-none");
        registerPointBtn.innerHTML =
            '<i class="bi bi-camera me-2"></i>Capturar Foto';
        registerPointBtn.disabled = false;
        confirmPointBtn.classList.add("d-none"); // Esconder botão de confirmação
        confirmPointBtn.disabled = true; // Desabilitar botão de confirmação
        retryBtn.classList.add("d-none");
        confirmationMessage.classList.add("d-none"); // Esconder mensagem de confirmação
    } catch (error) {
        alert(
            "Não foi possível acessar a câmera. Por favor, verifique as permissões."
        );
    }
}
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }
    cameraVideo.classList.add("d-none");
    cameraPlaceholder.classList.remove("d-none");
}
function capturePhoto() {
    const canvas = cameraCanvas;
    const video = cameraVideo;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    capturedImage = canvas.toDataURL("image/jpeg"); // Armazenar a imagem
    capturedImageEl.src = capturedImage;
    capturedImageEl.classList.remove("d-none");
    cameraVideo.classList.add("d-none");
    stopCamera();
    registerPointBtn.disabled = true; // Desabilitar botão de registro/captura
    registerPointBtn.innerHTML =
        '<i class="bi bi-check-circle me-2"></i>Foto Capturada';
    confirmPointBtn.classList.remove("d-none"); // Mostrar botão de confirmação
    confirmPointBtn.disabled = false; // Habilitar botão de confirmação
    retryBtn.classList.remove("d-none");
    confirmationMessage.classList.add("d-none"); // Esconder mensagem de confirmação
}
// Nova função para confirmar o ponto após a captura
function handleConfirmPoint() {
    if (!capturedImage) {
        alert("Nenhuma foto foi capturada.");
        return;
    }

    // Adicionar o registro ao mockRecords
    const newRecord = {
        id: mockRecords.length + 1,
        userId: currentUser.id,
        userName: currentUser.name,
        type: selectedPointType,
        timestamp: formatDateTime(new Date()), // Usando o novo formato de data
        photo: capturedImage, // Usar a imagem capturada
    };
    mockRecords.push(newRecord);

    // Feedback visual
    confirmPointBtn.classList.add("d-none"); // Esconder botão de confirmação
    retryBtn.classList.add("d-none"); // Esconder botão de tentar novamente
    confirmationMessage.classList.remove("d-none"); // Mostrar mensagem de confirmação
    
    alert(`Ponto de ${selectedPointType} registrado com sucesso!`);

    // Atualizar a lista de registros do funcionário
    loadEmployeeRecords();

    // Resetar o estado da câmera após 2 segundos
    setTimeout(() => {
        resetCameraState();
    }, 2000);
}
function handleRegisterPoint() {
    if (!capturedImage) {
        if (cameraStream) {
            capturePhoto();
        } else {
            startCamera();
        }
    }
    // Removido o código de adicionar registro direto aqui
}
function handleRetry() {
    capturedImage = null;
    resetCameraState();
    startCamera();
}
function resetCameraState() {
    stopCamera();
    capturedImage = null;
    capturedImageEl.classList.add("d-none");
    cameraPlaceholder.classList.remove("d-none");
    registerPointBtn.innerHTML =
        '<i class="bi bi-camera me-2"></i>Registrar Ponto';
    registerPointBtn.disabled = false;
    confirmPointBtn.classList.add("d-none"); // Esconder botão de confirmação
    confirmPointBtn.disabled = true; // Desabilitar botão de confirmação
    retryBtn.classList.add("d-none");
    confirmationMessage.classList.add("d-none"); // Esconder mensagem de confirmação
}
// Função para formatar data e hora no padrão DD/MM/YYYY HH:MM:SS
function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
// Função para converter string DD/MM/YYYY HH:MM:SS para objeto Date
function parseDateTime(dateTimeString) {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart ? timePart.split(':') : [0, 0, 0];
    return new Date(year, month - 1, day, hours, minutes, seconds);
}
// Função para converter string YYYY-MM-DD (do input date) para DD/MM/YYYY
function formatDateInputToDisplay(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}
function loadEmployeeRecords() {
    const userRecords = mockRecords.filter(
        (r) => r.userId === currentUser.id
    );
    recordsList.innerHTML = "";
    if (userRecords.length === 0) {
        recordsList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-clock-history fs-1 text-muted mb-3"></i>
                        <p class="text-muted mb-0">Nenhum registro encontrado</p>
                    </div>
                `;
        return;
    }
    userRecords.sort(
        (a, b) => parseDateTime(b.timestamp) - parseDateTime(a.timestamp)
    );
    userRecords.forEach((record) => {
      const recordEl = document.createElement("div");
      recordEl.className = "record-item border rounded p-3 mb-3";
      recordEl.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="d-flex align-items-center mb-1">
                                <span class="status-indicator ${record.type} me-2"></span>
                                <strong class="text-capitalize">${record.type}</strong>
                            </div>
                            <small class="text-muted">${record.timestamp}</small>
                        </div>
                        <img src="${record.photo}" alt="Foto do ponto" class="rounded" style="width: 60px; height: 40px; object-fit: cover; cursor: pointer;" onclick="showPhotoModal('${record.photo}')">
                    </div>
                `;
      recordsList.appendChild(recordEl);
    });
}
function loadAdminRecords() {
    filteredRecords = applyRecordFilters();
    adminRecordsTable.innerHTML = "";
    if (filteredRecords.length === 0) {
        adminRecordsTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4">
                            <i class="bi bi-search fs-1 text-muted mb-3"></i>
                            <p class="text-muted mb-0">Nenhum registro encontrado com os filtros aplicados</p>
                        </td>
                    </tr>
                `;
        recordsCount.textContent = "Total: 0 registros";
        return;
    }
    filteredRecords.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <i class="bi bi-person text-primary"></i>
                            </div>
                            ${record.userName}
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-${
                          record.type === "entrada"
                            ? "success"
                            : record.type === "intervalo"
                            ? "warning"
                            : record.type === "retorno"
                            ? "orange"
                            : "danger"
                        }">
                            ${
                              record.type.charAt(0).toUpperCase() +
                              record.type.slice(1)
                            }
                        </span>
                    </td>
                    <td>${record.timestamp}</td>
                    <td>
                        <img src="${
                          record.photo
                        }" alt="Foto do ponto" class="rounded" style="width: 60px; height: 40px; object-fit: cover; cursor: pointer;" onclick="showPhotoModal('${
            record.photo
          }')">
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewRecordDetails(${
                          record.id
                        })">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
        adminRecordsTable.appendChild(row);
    });
    recordsCount.textContent = `Total: ${filteredRecords.length} registros`;
}
function applyRecordFilters() {
    let records = [...mockRecords];
    // Filter by employee
    const employeeId = filterEmployee.value;
    if (employeeId) {
        records = records.filter((r) => r.userId == employeeId);
    }
    // Filter by date range
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    if (startDate) {
        // Converter a data do input (YYYY-MM-DD) para o formato do registro (DD/MM/YYYY)
        const startDisplayFormat = formatDateInputToDisplay(startDate);
        const startDateTime = `${startDisplayFormat} 00:00:00`;
        records = records.filter(
            (r) => parseDateTime(r.timestamp) >= parseDateTime(startDateTime)
        );
    }
    if (endDate) {
        // Converter a data do input (YYYY-MM-DD) para o formato do registro (DD/MM/YYYY)
        const endDisplayFormat = formatDateInputToDisplay(endDate);
        const endDateTime = `${endDisplayFormat} 23:59:59`;
        records = records.filter(
            (r) => parseDateTime(r.timestamp) <= parseDateTime(endDateTime)
        );
    }
    // Filter by point type
    const pointType = filterPointType.value;
    if (pointType) {
        records = records.filter((r) => r.type === pointType);
    }
    return records;
}
function applyFilters() {
    loadAdminRecords();
}
function loadUsersList() {
    usersList.innerHTML = "";
    const employees = mockUsers.filter((u) => u.role === "employee");
    employees.forEach((user) => {
        const userEl = document.createElement("div");
        userEl.className =
            "d-flex align-items-center p-2 border rounded mb-2";
        userEl.innerHTML = `
                    <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <i class="bi bi-person text-primary"></i>
                    </div>
                    <div>
                        <div class="fw-medium">${user.name}</div>
                        <small class="text-muted">${user.email}</small>
                    </div>
                `;
        usersList.appendChild(userEl);
    });
}
function loadUsersTable() {
    usersTable.innerHTML = "";
    mockUsers.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge bg-${
                          user.role === "admin" ? "danger" : "success"
                        }">
                            ${
                              user.role === "admin"
                                ? "Administrador"
                                : "Funcionário"
                            }
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#userModal" data-action="edit" data-id="${
                          user.id
                        }">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${
                          user.id
                        })">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
        usersTable.appendChild(row);
    });
    // Add event listeners to edit buttons
    document
        .querySelectorAll('[data-bs-target="#userModal"][data-action="edit"]')
        .forEach((btn) => {
            btn.addEventListener("click", () => {
                const userId = btn.dataset.id;
                editUser(userId);
            });
        });
}
function editUser(userId) {
    const user = mockUsers.find((u) => u.id == userId);
    if (user) {
        userIdInput.value = user.id;
        userNameInput.value = user.name;
        userEmailInput.value = user.email;
        userPasswordInput.value = user.password;
        userRoleInput.value = user.role;
        userModalTitle.textContent = "Editar Usuário";
    }
}
function saveUser() {
    const id = userIdInput.value;
    const name = userNameInput.value;
    const email = userEmailInput.value;
    const password = userPasswordInput.value;
    const role = userRoleInput.value;
    if (id) {
        // Edit existing user
        const userIndex = mockUsers.findIndex((u) => u.id == id);
        if (userIndex !== -1) {
            mockUsers[userIndex] = {
                id: parseInt(id),
                name,
                email,
                password,
                role,
            };
        }
    } else {
        // Create new user
        const newId = Math.max(...mockUsers.map((u) => u.id)) + 1;
        mockUsers.push({ id: newId, name, email, password, role });
    }
    loadUsersTable();
    loadUsersList();
    populateEmployeeFilter();
    bootstrap.Modal.getInstance(
        document.getElementById("userModal")
    ).hide();
}
function deleteUser(userId) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
        mockUsers = mockUsers.filter((u) => u.id != userId);
        loadUsersTable();
        loadUsersList();
        populateEmployeeFilter();
    }
}
function resetUserForm() {
    userForm.reset();
    userIdInput.value = "";
    userModalTitle.textContent = "Novo Usuário";
}
function showPhotoModal(photoUrl) {
    modalPhoto.src = photoUrl;
    const modal = new bootstrap.Modal(
        document.getElementById("photoModal")
    );
    modal.show();
}
function viewRecordDetails(recordId) {
    const record = mockRecords.find((r) => r.id == recordId);
    if (record) {
        alert(
            `Detalhes do registro:
Funcionário: ${record.userName}
Tipo: ${record.type}
Data/Hora: ${record.timestamp}`
        );
    }
}
function exportToCSV() {
    if (filteredRecords.length === 0) {
        alert("Nenhum registro para exportar.");
        return;
    }
    let csv = "Funcionário,Tipo,Data/Hora";
    filteredRecords.forEach((record) => {
        csv += `"${record.userName}","${record.type}","${record.timestamp}"
`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registros_ponto.csv";
    a.click();
    window.URL.revokeObjectURL(url);
}
function exportToXML() {
    if (filteredRecords.length === 0) {
        alert("Nenhum registro para exportar.");
        return;
    }
    let xml = '<?xml version="1.0" encoding="UTF-8"?><registros>';
    filteredRecords.forEach((record) => {
        xml += `  <registro>
`;
        xml += `    <funcionario>${record.userName}</funcionario>
`;
        xml += `    <tipo>${record.type}</tipo>
`;
        xml += `    <data_hora>${record.timestamp}</data_hora>
`;
        xml += `  </registro>
`;
    });
    xml += "</registros>";
    const blob = new Blob([xml], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registros_ponto.xml";
    a.click();
    window.URL.revokeObjectURL(url);
}
// Funções para relatórios de horas trabalhadas
function loadHoursReport() {
    const startDate = reportStartDate.value;
    const endDate = reportEndDate.value;
    const employeeFilter = reportEmployeeFilter.value;
    
    // Calcular horas trabalhadas
    const hoursData = calculateHoursWorked(startDate, endDate, employeeFilter);
    
    // Renderizar tabela
    renderHoursReport(hoursData, startDate, endDate);
}
function calculateHoursWorked(startDate, endDate, employeeFilter) {
    const result = [];
    let employees = mockUsers.filter(u => u.role === "employee");
    
    // Filtrar por funcionário se especificado
    if (employeeFilter) {
        employees = employees.filter(u => u.id == employeeFilter);
    }
    
    employees.forEach(employee => {
        // Filtrar registros do funcionário
        let employeeRecords = mockRecords.filter(r => r.userId === employee.id);
        
        // Aplicar filtros de data se especificados
        if (startDate) {
            const startDisplayFormat = formatDateInputToDisplay(startDate);
            const startDateTime = `${startDisplayFormat} 00:00:00`;
            employeeRecords = employeeRecords.filter(
                r => parseDateTime(r.timestamp) >= parseDateTime(startDateTime)
            );
        }
        if (endDate) {
            const endDisplayFormat = formatDateInputToDisplay(endDate);
            const endDateTime = `${endDisplayFormat} 23:59:59`;
            employeeRecords = employeeRecords.filter(
                r => parseDateTime(r.timestamp) <= parseDateTime(endDateTime)
            );
        }
        
        // Agrupar registros por dia
        const recordsByDay = {};
        employeeRecords.forEach(record => {
            const date = record.timestamp.split(' ')[0]; // DD/MM/YYYY
            if (!recordsByDay[date]) {
                recordsByDay[date] = [];
            }
            recordsByDay[date].push(record);
        });
        
        // Calcular horas por dia
        let totalSeconds = 0;
        Object.keys(recordsByDay).forEach(date => {
            const dayRecords = recordsByDay[date];
            
            // Ordenar registros do dia por hora
            dayRecords.sort((a, b) => parseDateTime(a.timestamp) - parseDateTime(b.timestamp));
            
            // Calcular períodos de trabalho
            let entrada = null;
            let intervalo = null;
            let retorno = null;
            
            dayRecords.forEach(record => {
                if (record.type === "entrada") {
                    entrada = parseDateTime(record.timestamp);
                } else if (record.type === "intervalo" && entrada) {
                    totalSeconds += (parseDateTime(record.timestamp) - entrada) / 1000;
                    intervalo = parseDateTime(record.timestamp);
                } else if (record.type === "retorno" && intervalo) {
                    retorno = parseDateTime(record.timestamp);
                } else if (record.type === "saida" && (entrada || retorno)) {
                    const start = retorno || entrada;
                    totalSeconds += (parseDateTime(record.timestamp) - start) / 1000;
                }
            });
        });
        
        if (totalSeconds > 0) {
            result.push({
                employeeId: employee.id,
                employeeName: employee.name,
                totalSeconds: totalSeconds // Armazenar em segundos para formatação precisa
            });
        }
    });
    
    return result;
}
function renderHoursReport(data, startDate, endDate) {
    hoursReportTable.innerHTML = "";
    
    if (data.length === 0) {
        hoursReportTable.innerHTML = `
      <tr>
        <td colspan="3" class="text-center">Nenhum dado encontrado para os filtros aplicados</td>
      </tr>
    `;
        return;
    }
    
    // Formatar o período
    let period = "Todo o período";
    if (startDate && endDate) {
        period = `${formatDateInputToDisplay(startDate)} até ${formatDateInputToDisplay(endDate)}`;
    } else if (startDate) {
        period = `A partir de ${formatDateInputToDisplay(startDate)}`;
    } else if (endDate) {
        period = `Até ${formatDateInputToDisplay(endDate)}`;
    }
    
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${item.employeeName}</td>
      <td>${formatDuration(item.totalSeconds)}</td>
      <td>${period}</td>
    `;
        hoursReportTable.appendChild(row);
    });
}
// Função para formatar segundos em "X horas, Y minutos e Z segundos"
function formatDuration(seconds) {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    let result = '';
    if (hours > 0) {
        result += `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        if (result) result += ', ';
        result += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
    if (secs > 0 || result === '') { // Mostrar segundos se for 0 ou se não houver horas/minutos
        if (result) result += ' e ';
        result += `${secs} segundo${secs > 1 ? 's' : ''}`;
    }
    return result;
}
function exportHoursToCSV() {
    // Obter dados atuais do relatório
    const startDate = reportStartDate.value;
    const endDate = reportEndDate.value;
    const employeeFilter = reportEmployeeFilter.value;
    const hoursData = calculateHoursWorked(startDate, endDate, employeeFilter);
    
    if (hoursData.length === 0) {
        alert("Nenhum dado para exportar.");
        return;
    }
    
    // Formatar o período para o CSV
    let period = "Todo o período";
    if (startDate && endDate) {
        period = `${formatDateInputToDisplay(startDate)} até ${formatDateInputToDisplay(endDate)}`;
    } else if (startDate) {
        period = `A partir de ${formatDateInputToDisplay(startDate)}`;
    } else if (endDate) {
        period = `Até ${formatDateInputToDisplay(endDate)}`;
    }
    
    let csv = "Funcionário,Tempo Trabalhado,Período";
    hoursData.forEach(item => {
        csv += `"${item.employeeName}","${formatDuration(item.totalSeconds)}","${period}"
`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_horas_trabalhadas.csv";
    a.click();
    window.URL.revokeObjectURL(url);
}
function exportHoursToXML() {
    // Obter dados atuais do relatório
    const startDate = reportStartDate.value;
    const endDate = reportEndDate.value;
    const employeeFilter = reportEmployeeFilter.value;
    const hoursData = calculateHoursWorked(startDate, endDate, employeeFilter);
    
    if (hoursData.length === 0) {
        alert("Nenhum dado para exportar.");
        return;
    }
    
    // Formatar o período para o XML
    let period = "Todo o período";
    if (startDate && endDate) {
        period = `${formatDateInputToDisplay(startDate)} até ${formatDateInputToDisplay(endDate)}`;
    } else if (startDate) {
        period = `A partir de ${formatDateInputToDisplay(startDate)}`;
    } else if (endDate) {
        period = `Até ${formatDateInputToDisplay(endDate)}`;
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?><relatorio_horas>';
    hoursData.forEach(item => {
        xml += `  <registro>
`;
        xml += `    <funcionario>${item.employeeName}</funcionario>
`;
        xml += `    <tempo_trabalhado>${formatDuration(item.totalSeconds)}</tempo_trabalhado>
`;
        xml += `    <periodo>${period}</periodo>
`;
        xml += `  </registro>
`;
    });
    xml += "</relatorio_horas>";
    
    const blob = new Blob([xml], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_horas_trabalhadas.xml";
    a.click();
    window.URL.revokeObjectURL(url);
}
// Initialize
showView("login");