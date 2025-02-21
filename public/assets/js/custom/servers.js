let dataTable;

document.addEventListener('DOMContentLoaded', function () {
    dataTable = $('#serversTable').DataTable({
        responsive: true,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        language: {
            emptyTable: "Nessun server disponibile",
            lengthMenu: "Mostra _MENU_",
            search: "",
            searchPlaceholder: "Cerca...",
            info: "Visualizzazione _START_ a _END_ di _TOTAL_ elementi",
            infoEmpty: "Nessun elemento da visualizzare",
            zeroRecords: "Nessuna corrispondenza trovata"
        }
    });

    initializeFormListeners();
    attachEventListeners();
});

function toggleLoading(show = true) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('d-none');
    } else {
        loading.classList.add('d-none');
    }
}

function formatMaxUsers(maxUsers) {
    return maxUsers ? maxUsers : 'Unlimited';
}

function updateTable(server, action = 'update') {
    if (action === 'add') {
        const newRow = [
            dataTable.data().length + 1,
            server.is_active ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Blocked</span>',
            server.name,
            server.server_type.name,
            server.api_url,
            `<div class="text-center">${formatMaxUsers(server.max_users)}</div>`,
            generateActionsHtml(server)
        ];

        dataTable.row.add(newRow).draw();
    } else if (action === 'update') {
        const row = dataTable.row($(`button[data-id="${server.id}"]`).closest('tr'));
        const updatedData = [
            row.index() + 1,
            server.is_active ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Blocked</span>',
            server.name,
            server.server_type.name,
            server.api_url,
            `<div class="text-center">${formatMaxUsers(server.max_users)}</div>`,
            generateActionsHtml(server)
        ];
        row.data(updatedData).draw();
    } else if (action === 'delete') {
        const row = dataTable.row($(`button[data-id="${server.id}"]`).closest('tr'));
        row.remove().draw();

        dataTable.rows().every(function (rowIdx) {
            const data = this.data();
            data[0] = rowIdx + 1;
            this.data(data);
        });
        dataTable.draw();
    }

    dataTable.columns.adjust().responsive.recalc();
}

function generateActionsHtml(server) {
    return `<div class="text-center">
        <button type="button" class="btn btn-icon btn-sm btn-warning me-1"
            data-bs-toggle="modal"
            data-bs-target="#editServerModal"
            data-id="${server.id}"
            data-info='${JSON.stringify(server)}'
            title="Edit server">
            <i class="ti ti-pencil"></i>
        </button>
        <button type="button"
            class="btn btn-icon btn-sm ${server.is_active ? 'btn-danger' : 'btn-success'} me-1"
            onclick="toggleServerStatus(${server.id}, '${server.name}')"
            title="${server.is_active ? 'Block' : 'Activate'} server">
            <i class="ti ${server.is_active ? 'ti-lock' : 'ti-lock-open'}"></i>
        </button>
        <button type="button" class="btn btn-icon btn-sm btn-danger"
            data-bs-toggle="modal"
            data-bs-target="#deleteServerModal"
            data-id="${server.id}"
            data-name="${server.name}"
            title="Delete server">
            <i class="ti ti-trash"></i>
        </button>
    </div>`;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `bs-toast toast fade show border-2 border-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <i class="ti ti-${type === 'success' ? 'check' : 'x'} me-2 text-${type}"></i>
            <span class="me-auto fw-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function toggleServerStatus(serverId, serverName) {
    toggleLoading(true);

    fetch(`/servers/${serverId}/toggle-status`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateTable(data.server, 'update');
                showToast(data.message, 'success');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('Errore durante l\'aggiornamento dello stato del server', 'danger');
            console.error('Error:', error);
        })
        .finally(() => {
            toggleLoading(false);
        });
}

function attachEventListeners() {
    $(document).on('show.bs.modal', '#editServerModal', function (event) {
        const button = $(event.relatedTarget);
        const info = JSON.parse(button.attr('data-info'));
        const form = document.getElementById('editServerForm');

        form.action = `/servers/${info.id}`;
        document.getElementById('edit_name').value = info.name;
        document.getElementById('edit_server_type_id').value = info.server_type_id;
        document.getElementById('edit_api_url').value = info.api_url;
        document.getElementById('edit_api_key').value = info.api_key;
        document.getElementById('edit_max_users').value = info.max_users || '';
    });

    $(document).on('show.bs.modal', '#deleteServerModal', function (event) {
        const button = $(event.relatedTarget);
        const serverId = button.data('id');
        const serverName = button.data('name');

        const form = document.getElementById('deleteServerForm');
        form.action = `/servers/${serverId}`;
        document.getElementById('deleteServerName').textContent = serverName;
    });
}

function initializeFormListeners() {
    $('#addServerForm').on('submit', function (e) {
        e.preventDefault();
        const form = this;
        toggleLoading(true);

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
                    updateTable(data.server, 'add');
                    showToast(data.message, 'success');
                    $('#addServerModal').modal('hide');
                    form.reset();
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                showToast('Errore durante la creazione del server', 'danger');
                console.error('Error:', error);
            })
            .finally(() => {
                toggleLoading(false);
            });
    });

    $('#editServerForm').on('submit', function (e) {
        e.preventDefault();
        const form = this;
        toggleLoading(true);

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
                    updateTable(data.server, 'update');
                    showToast(data.message, 'success');
                    $('#editServerModal').modal('hide');
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                showToast('Errore durante l\'aggiornamento del server', 'danger');
                console.error('Error:', error);
            })
            .finally(() => {
                toggleLoading(false);
            });
    });

    $('#deleteServerForm').on('submit', function (e) {
        e.preventDefault();
        const form = this;
        toggleLoading(true);

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
                    updateTable({ id: data.serverId }, 'delete');
                    showToast(data.message, 'success');
                    $('#deleteServerModal').modal('hide');
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                showToast('Errore durante l\'eliminazione del server', 'danger');
                console.error('Error:', error);
            })
            .finally(() => {
                toggleLoading(false);
            });
    });
}
