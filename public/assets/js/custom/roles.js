document.addEventListener('DOMContentLoaded', function () {
    attachEventListeners();
});

// Funzione Toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');

    let icon, colorClass, borderClass;
    switch (type) {
        case 'success':
            icon = 'ti-check';
            colorClass = 'text-success';
            borderClass = 'border-success';
            break;
        case 'danger':
            icon = 'ti-x';
            colorClass = 'text-danger';
            borderClass = 'border-danger';
            break;
        case 'warning':
            icon = 'ti-alert-triangle';
            colorClass = 'text-warning';
            borderClass = 'border-warning';
            break;
        case 'info':
            icon = 'ti-info-circle';
            colorClass = 'text-info';
            borderClass = 'border-info';
            break;
    }

    const toast = document.createElement('div');
    toast.className = `bs-toast toast fade show border-2 ${borderClass}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="toast-header">
            <i class="ti ${icon} me-2 ${colorClass}"></i>
            <span class="me-auto fw-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    container.appendChild(toast);

    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'transform 0.3s ease-in-out';
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Funzione per aggiornare la matrice
function updateMatrix(role, action = 'update') {
    const table = document.querySelector('.table');
    const headers = table.querySelector('thead tr');
    const rows = table.querySelectorAll('tbody tr');

    if (action === 'add') {
        // Aggiunge nuova colonna nell'header
        const newHeader = document.createElement('th');
        newHeader.className = 'text-white';
        newHeader.setAttribute('data-role-id', role.id);
        newHeader.style.minWidth = '150px';
        newHeader.innerHTML = `
            <div class="role-header">
                <span class="role-name">${role.name}</span>
                <div class="role-actions">
                    <button type="button" class="btn btn-icon btn-warning btn-xs edit-role-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#editRoleModal"
                        data-id="${role.id}"
                        data-name="${role.name}"
                        data-permissions="${JSON.stringify(role.permissions.map(p => p.id))}">
                        <i class="ti ti-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-icon btn-danger btn-xs delete-role-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteRoleModal"
                        data-id="${role.id}"
                        data-name="${role.name}">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>
        `;
        headers.appendChild(newHeader);

        // Aggiunge celle per ogni permesso
        rows.forEach(row => {
            const permissionId = row.getAttribute('data-permission-id');
            const td = document.createElement('td');
            td.className = 'text-center';
            td.setAttribute('data-role-id', role.id);
            td.innerHTML = `
                <i class="ti ${role.permissions.find(p => p.id == permissionId) ? 'ti-check text-success' : 'ti-x text-danger'} fs-4"></i>
            `;
            row.appendChild(td);
        });
    } else if (action === 'update') {
        // Aggiorna header esistente
        const headerCell = headers.querySelector(`[data-role-id="${role.id}"]`);
        if (headerCell) {
            headerCell.querySelector('.role-name').textContent = role.name;

            // Aggiorna anche i data attributes del pulsante edit
            const editButton = headerCell.querySelector('.edit-role-btn');
            if (editButton) {
                editButton.setAttribute('data-name', role.name);
                editButton.setAttribute('data-permissions', JSON.stringify(role.permissions.map(p => p.id)));
            }
        }

        // Aggiorna celle dei permessi
        rows.forEach(row => {
            const permissionId = row.getAttribute('data-permission-id');
            const td = row.querySelector(`[data-role-id="${role.id}"]`);
            if (td) {
                td.innerHTML = `
                    <i class="ti ${role.permissions.find(p => p.id == permissionId) ? 'ti-check text-success' : 'ti-x text-danger'} fs-4"></i>
                `;
            }
        });
    } else if (action === 'delete') {
        // Rimuove la colonna
        const headerCell = headers.querySelector(`[data-role-id="${role.id}"]`);
        if (headerCell) headerCell.remove();

        // Rimuove le celle corrispondenti
        rows.forEach(row => {
            const td = row.querySelector(`[data-role-id="${role.id}"]`);
            if (td) td.remove();
        });
    }

    // Riattacca gli event listeners
    attachEventListeners();
}

// Event Listeners
function attachEventListeners() {
    // Event listener per pulsanti di edit
    document.querySelectorAll('.edit-role-btn').forEach(button => {
        button.addEventListener('click', function () {
            const roleId = this.getAttribute('data-id');
            const roleName = this.getAttribute('data-name');
            const permissions = JSON.parse(this.getAttribute('data-permissions'));

            const form = document.getElementById('editRoleForm');
            form.action = `/roles/${roleId}`;
            document.getElementById('edit_name').value = roleName;

            // Reset e imposta le checkbox dei permessi
            document.querySelectorAll('.edit-permission-checkbox').forEach(checkbox => {
                checkbox.checked = permissions.includes(parseInt(checkbox.value));
            });
        });
    });

    // Event listener per pulsanti di delete
    document.querySelectorAll('.delete-role-btn').forEach(button => {
        button.addEventListener('click', function () {
            const roleId = this.getAttribute('data-id');
            const roleName = this.getAttribute('data-name');

            const form = document.getElementById('deleteRoleForm');
            form.action = `/roles/${roleId}`;
            document.getElementById('deleteRoleName').textContent = roleName;
        });
    });
}

// Gestione form di aggiunta
document.getElementById('addRoleForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = this;

    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateMatrix(data.role, 'add');
                showToast(data.message, 'success');
                $('#addRoleModal').modal('hide');
                form.reset();
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('An error occurred while processing your request', 'danger');
        });
});

// Gestione form di modifica
document.getElementById('editRoleForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);
    formData.append('_method', 'PUT');

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateMatrix(data.role, 'update');
                showToast(data.message, 'success');
                $('#editRoleModal').modal('hide');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('An error occurred while processing your request', 'danger');
        });
});

// Gestione form di eliminazione
document.getElementById('deleteRoleForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);
    formData.append('_method', 'DELETE');

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateMatrix({ id: data.roleId }, 'delete');
                showToast(data.message, 'success');
                $('#deleteRoleModal').modal('hide');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('An error occurred while processing your request', 'danger');
            console.error('Error:', error);
        });
});
