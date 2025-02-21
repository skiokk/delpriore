let dataTable;

document.addEventListener('DOMContentLoaded', function () {
    // Inizializzazione DataTable
    dataTable = $('#subscriptionsTable').DataTable({
        responsive: true,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        language: {
            emptyTable: "No subscriptions available",
            lengthMenu: "Show _MENU_",
            search: "",
            searchPlaceholder: "Search...",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            infoEmpty: "Showing 0 to 0 of 0 entries",
            zeroRecords: "No matching records found"
        }
    });

    // Inizializza gli event listeners
    attachEventListeners();
});

// Funzione per aggiornare la tabella
function updateTable(subscription, action = 'update') {
    if (action === 'add') {
        const newRow = [
            dataTable.data().length + 1,
            subscription.name,
            `${subscription.duration} ${subscription.duration === 1 ? subscription.duration_type.slice(0, -1) : subscription.duration_type}`,
            `<div class="text-center">${subscription.credits == 0 ? '<span class="badge bg-primary">FREE</span>' : subscription.credits}</div>`,
            `<div class="text-center">${subscription.is_active ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}</div>`,
            `<div class="text-center">
                <button type="button" class="btn btn-icon btn-warning me-2 edit-subscription-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#editSubscriptionModal"
                    data-id="${subscription.id}"
                    data-info='${JSON.stringify(subscription)}'>
                    <i class="ti ti-pencil"></i>
                </button>
                <button type="button" class="btn btn-icon btn-danger delete-subscription-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteSubscriptionModal"
                    data-id="${subscription.id}"
                    data-name="${subscription.name}">
                    <i class="ti ti-trash"></i>
                </button>
            </div>`
        ];

        dataTable.row.add(newRow).draw();
    } else if (action === 'update') {
        const row = dataTable.row($(`button[data-id="${subscription.id}"]`).closest('tr'));
        const updatedData = [
            row.index() + 1,
            subscription.name,
            `${subscription.duration} ${subscription.duration === 1 ? subscription.duration_type.slice(0, -1) : subscription.duration_type}`,
            subscription.credits,
            subscription.is_active ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>',
            `<div class="text-center">
                <button type="button" class="btn btn-icon btn-warning me-2 edit-subscription-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#editSubscriptionModal"
                    data-id="${subscription.id}"
                    data-info='${JSON.stringify(subscription)}'>
                    <i class="ti ti-pencil"></i>
                </button>
                <button type="button" class="btn btn-icon btn-danger delete-subscription-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteSubscriptionModal"
                    data-id="${subscription.id}"
                    data-name="${subscription.name}">
                    <i class="ti ti-trash"></i>
                </button>
            </div>`
        ];
        row.data(updatedData).draw();
    } else if (action === 'delete') {
        const row = dataTable.row($(`button[data-id="${subscription.id}"]`).closest('tr'));
        row.remove().draw();

        // Aggiorna gli indici
        dataTable.rows().every(function (rowIdx) {
            const data = this.data();
            data[0] = rowIdx + 1;
            this.data(data);
        });
        dataTable.draw();
    }

    // Riattacca gli event listeners
    attachEventListeners();
}

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

// Event Listeners
function attachEventListeners() {
    // Event listener per pulsanti di edit
    document.querySelectorAll('.edit-subscription-btn').forEach(button => {
        button.addEventListener('click', function () {
            const info = JSON.parse(this.getAttribute('data-info'));

            const form = document.getElementById('editSubscriptionForm');
            form.action = `/subscriptions/${info.id}`;

            document.getElementById('edit_name').value = info.name;
            document.getElementById('edit_duration').value = info.duration;
            document.getElementById('edit_duration_type').value = info.duration_type;
            document.getElementById('edit_credits').value = info.credits;
            document.getElementById('edit_is_active').value = info.is_active ? "1" : "0";
        });
    });

    // Event listener per pulsanti di delete
    document.querySelectorAll('.delete-subscription-btn').forEach(button => {
        button.addEventListener('click', function () {
            const subscriptionId = this.getAttribute('data-id');
            const subscriptionName = this.getAttribute('data-name');

            const form = document.getElementById('deleteSubscriptionForm');
            form.action = `/subscriptions/${subscriptionId}`;
            document.getElementById('deleteSubscriptionName').textContent = subscriptionName;
        });
    });
}

// Gestione form di aggiunta
document.getElementById('addSubscriptionForm').addEventListener('submit', function (e) {
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
                updateTable(data.subscription, 'add');
                showToast(data.message, 'success');
                $('#addSubscriptionModal').modal('hide');
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
document.getElementById('editSubscriptionForm').addEventListener('submit', function (e) {
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
                updateTable(data.subscription, 'update');
                showToast(data.message, 'success');
                $('#editSubscriptionModal').modal('hide');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('An error occurred while processing your request', 'danger');
        });
});

// Gestione form di eliminazione
document.getElementById('deleteSubscriptionForm').addEventListener('submit', function (e) {
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
                updateTable({ id: data.subscriptionId }, 'delete');
                showToast(data.message, 'success');
                $('#deleteSubscriptionModal').modal('hide');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('An error occurred while processing your request', 'danger');
            console.error('Error:', error);
        });
});
