let dataTable;

document.addEventListener('DOMContentLoaded', function () {
    initializeDataTable();
    initializeFormListeners();
    attachEventListeners();
});

function initializeDataTable() {
    dataTable = $('#usersTable').DataTable({
        responsive: true,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        language: {
            emptyTable: "No users available",
            lengthMenu: "Show _MENU_",
            search: "",
            searchPlaceholder: "Search...",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            infoEmpty: "Showing 0 to 0 of 0 entries",
            zeroRecords: "No matching records found"
        },
        columnDefs: [
            { className: "text-center", targets: [6, 7] }  // Centra le colonne notes e actions
        ]
    });
}

function toggleLoading(show = true) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('d-none', !show);
}

function updateTable(user, action = 'update') {
    const formatRow = (user) => [
        dataTable.data().length + 1,
        getStatusBadge(user.status),
        user.username,
        user.server.name,
        user.reseller.username,
        new Date(user.expires_at).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        user.notes || '-',
        generateActionsHtml(user)
    ];

    if (action === 'add') {
        dataTable.row.add(formatRow(user)).draw();
    } else if (action === 'update') {
        const rowIndex = findRowIndex(user.id);
        if (rowIndex !== -1) {
            dataTable.row(rowIndex).data(formatRow(user)).draw();
        }
    } else if (action === 'delete') {
        const rowIndex = findRowIndex(user.id);
        if (rowIndex !== -1) {
            dataTable.row(rowIndex).remove().draw();
            updateRowNumbers();
        }
    }
}

function getStatusBadge(status) {
    const badges = {
        1: '<span class="badge bg-success">Active</span>',
        0: '<span class="badge bg-danger">Blocked</span>',
        2: '<span class="badge bg-warning">Expired</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

function generateActionsHtml(user) {
    return `
    <div class="dropdown position-relative">
        <button class="btn btn-link p-0 text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="ti ti-dots-vertical fs-5 text-secondary"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end p-2 shadow-lg rounded" style="min-width: 200px;">
            <li>
                <a class="dropdown-item d-flex align-items-center" href="/users/${user.id}/advanced-settings">
                    <i class="ti ti-settings me-2 text-primary"></i> Advanced Settings
                </a>
            </li>
            <li>
                <a class="dropdown-item d-flex align-items-center" href="#"
                   data-bs-toggle="modal"
                   data-bs-target="#editUserModal"
                   data-id="${user.id}"
                   data-info='${JSON.stringify(user)}'>
                    <i class="ti ti-pencil me-2 text-warning"></i> Edit
                </a>
            </li>
            <li>
                <a class="dropdown-item d-flex align-items-center" href="#"
                   data-bs-toggle="modal"
                   data-bs-target="#extendSubscriptionModal"
                   data-id="${user.id}"
                   data-expires="${user.expires_at}">
                    <i class="ti ti-calendar-plus me-2 text-success"></i> Extend Subscription
                </a>
            </li>
            <li>
                <a class="dropdown-item d-flex align-items-center" href="#"
                   onclick="toggleUserStatus(${user.id}, '${user.username}')">
                    <i class="ti ${user.status === 1 ? 'ti-lock text-danger' : 'ti-lock-open text-success'} me-2"></i>
                    ${user.status === 1 ? 'Block' : 'Activate'}
                </a>
            </li>
            <li>
                <a class="dropdown-item d-flex align-items-center text-danger" href="#"
                   data-bs-toggle="modal"
                   data-bs-target="#deleteUserModal"
                   data-id="${user.id}"
                   data-username="${user.username}">
                    <i class="ti ti-trash me-2"></i> Delete
                </a>
            </li>
        </ul>
    </div>`;
}

function findRowIndex(userId) {
    return dataTable.rows().indexes().filter(idx => {
        const rowData = dataTable.row(idx).nodes().to$();
        return rowData.find(`[data-id="${userId}"]`).length > 0;
    })[0];
}

function updateRowNumbers() {
    dataTable.rows().every(function (rowIdx) {
        const data = this.data();
        data[0] = rowIdx + 1;
        this.data(data);
    });
    dataTable.draw();
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

function attachEventListeners() {
    $(document).on('show.bs.modal', '#editUserModal', function (event) {
        const button = $(event.relatedTarget);
        const info = JSON.parse(button.attr('data-info'));
        const form = document.getElementById('editUserForm');

        form.action = `/users/${info.id}`;
        document.getElementById('edit_password').value = ''; // Reset password field
        document.getElementById('edit_notes').value = info.notes || '';
    });

    $(document).on('show.bs.modal', '#extendSubscriptionModal', function (event) {
        const button = $(event.relatedTarget);
        const userId = button.data('id');
        const currentExpiration = new Date(button.data('expires'));

        const form = document.getElementById('extendSubscriptionForm');
        form.action = `/users/${userId}/extend`;

        document.getElementById('currentExpiration').textContent =
            currentExpiration.toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

        const subscriptionSelect = document.getElementById('extend_subscription_id');
        subscriptionSelect.value = '';
        document.getElementById('newExpiration').textContent = '';

        $(subscriptionSelect).off('change').on('change', function () {
            const option = this.options[this.selectedIndex];
            if (option.value) {
                const duration = parseInt(option.dataset.duration);
                const durationType = option.dataset.durationType;

                const newDate = new Date(currentExpiration);
                switch (durationType) {
                    case 'hours':
                        newDate.setHours(newDate.getHours() + duration);
                        break;
                    case 'days':
                        newDate.setDate(newDate.getDate() + duration);
                        break;
                    case 'months':
                        newDate.setMonth(newDate.getMonth() + duration);
                        break;
                }

                document.getElementById('newExpiration').textContent =
                    newDate.toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
            }
        });
    });

    $(document).on('show.bs.modal', '#deleteUserModal', function (event) {
        const button = $(event.relatedTarget);
        const userId = button.data('id');
        const username = button.data('username');

        const form = document.getElementById('deleteUserForm');
        form.action = `/users/${userId}`;
        document.getElementById('deleteUserName').textContent = username;
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = this;
    toggleLoading(true);

    const formData = new FormData(form);
    if (form.method === 'put') {
        formData.set('_method', 'PUT');
    }
    if (form.method === 'delete') {
        formData.set('_method', 'DELETE');
    }

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (data.user) {
                    updateTable(data.user, form.id === 'addUserForm' ? 'add' : 'update');
                } else if (form.id === 'deleteUserForm') {
                    updateTable({ id: form.action.split('/').pop() }, 'delete');
                }

                if (data.userCredits) {
                    updateCreditsDisplay(data.userCredits);
                }

                showToast(data.message, 'success');
                $(form).closest('.modal').modal('hide');
                if (form.id === 'addUserForm') form.reset();
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || 'Error processing request', 'danger');
        })
        .finally(() => {
            toggleLoading(false);
        });
}

function updateCreditsDisplay(credits) {
    const creditsElement = document.getElementById('userCredits');
    if (creditsElement) {
        if (credits === 'unlimited') {
            creditsElement.innerHTML = 'Credits: <i class="ti ti-infinity"></i>';
        } else {
            creditsElement.textContent = `Credits: ${credits}`;
        }
    }
}

function initializeFormListeners() {
    $('#addUserForm').on('submit', handleFormSubmit);
    $('#editUserForm').on('submit', handleFormSubmit);
    $('#deleteUserForm').on('submit', handleFormSubmit);
    $('#extendSubscriptionForm').on('submit', handleFormSubmit);
}

function toggleUserStatus(userId, username) {
    toggleLoading(true);

    fetch(`/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateTable(data.user, 'update');
                showToast(data.message, 'success');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error updating user status', 'danger');
        })
        .finally(() => {
            toggleLoading(false);
        });
}
