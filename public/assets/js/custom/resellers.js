// Variabili globali
let dataTable;

// Inizializzazione al caricamento del documento
document.addEventListener('DOMContentLoaded', function () {
    initializeDataTable();
    initializeFormListeners();
    attachEventListeners();
});

// Funzioni di inizializzazione DataTable
function initializeDataTable() {
    dataTable = $('#resellersTable').DataTable({
        processing: true,
        responsive: true,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        pageLength: 10,
        language: {
            emptyTable: "No resellers available",
            lengthMenu: "Show _MENU_",
            search: "",
            searchPlaceholder: "Search...",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            infoEmpty: "Showing 0 to 0 of 0 entries",
            zeroRecords: "No matching records found"
        },
        columnDefs: [
            { orderable: false, targets: [8] }
        ],
        order: [[0, 'asc']]
    });
}

// Gestione Crediti
function checkUnlimitedCredits() {
    const creditsElement = document.getElementById('userCredits');
    return creditsElement && creditsElement.innerHTML.includes('infinity');
}

function updateNavbarCredits(newCredits) {
    const hasUnlimitedCredits = checkUnlimitedCredits();
    if (hasUnlimitedCredits) return;

    const creditsElement = document.getElementById('userCredits');
    if (creditsElement) {
        creditsElement.innerHTML = newCredits === 'unlimited'
            ? 'Credits: <i class="ti ti-infinity"></i>'
            : `Credits: ${newCredits}`;
    }

    updateCreditsInModals(newCredits);
}

function updateCreditsInModals(newCredits) {
    const creditsInputs = document.querySelectorAll('#credits, #recharge_amount');
    const creditsHelpers = document.querySelectorAll('.text-muted');

    creditsInputs.forEach(input => {
        if (newCredits !== 'unlimited') {
            input.setAttribute('max', newCredits);
        } else {
            input.removeAttribute('max');
        }
    });

    creditsHelpers.forEach(helper => {
        if (helper.textContent.includes('Available credits')) {
            helper.innerHTML = newCredits === 'unlimited'
                ? 'Available credits: <i class="ti ti-infinity"></i> Unlimited'
                : `Available credits: ${newCredits}`;
        }
    });
}

// Gestione UI Loading
function toggleLoading(show = true) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('d-none', !show);
}

// Funzioni di aggiornamento tabella
function updateTable(reseller, action = 'update') {
    const formatRow = (reseller) => {
        const rowData = [
            dataTable.data().length + 1,
            getStatusBadge(reseller.is_active),
            reseller.username,
            reseller.creator ? reseller.creator.username : '-',
            reseller.role.name,
            formatCredits(reseller),
            formatLastRecharge(reseller.last_recharge_at),
            reseller.notes || '-',
            generateActionsHtml(reseller)
        ];
        return rowData;
    };

    switch (action) {
        case 'add':
            dataTable.row.add(formatRow(reseller)).draw();
            break;
        case 'update':
            const rowIndex = findRowIndex(reseller.id);
            if (rowIndex !== -1) {
                dataTable.row(rowIndex).data(formatRow(reseller)).draw();
            }
            break;
        case 'delete':
            const deleteRowIndex = findRowIndex(reseller.id);
            if (deleteRowIndex !== -1) {
                dataTable.row(deleteRowIndex).remove().draw();
                updateRowNumbers();
            }
            break;
    }

    dataTable.columns.adjust().responsive.recalc();
}

// Funzioni di formattazione
function getStatusBadge(isActive) {
    return isActive
        ? '<span class="badge bg-success">Active</span>'
        : '<span class="badge bg-danger">Blocked</span>';
}

function formatCredits(reseller) {
    return `<div class="text-center">${reseller.role.permissions.some(p => p.slug === 'unlimited-credits')
        ? '<i class="ti ti-infinity"></i>'
        : reseller.credits
        }</div>`;
}

function formatLastRecharge(lastRechargeAt) {
    if (!lastRechargeAt) return '-';
    return new Date(lastRechargeAt).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateActionsHtml(reseller) {
    return `
    <div class="dropdown position-relative">
        <button class="btn btn-link p-0 text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="ti ti-dots-vertical fs-5 text-secondary"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end p-2 shadow-lg rounded" style="min-width: 200px;">
            ${!reseller.role.permissions.some(p => p.slug === 'unlimited-credits') ? `
            <li>
                <a class="dropdown-item d-flex align-items-center" href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#rechargeModal"
                    data-id="${reseller.id}"
                    data-username="${reseller.username}">
                    <i class="ti ti-coin me-2 text-primary"></i> Recharge Credits
                </a>
            </li>` : ''}
            <li>
                <a class="dropdown-item d-flex align-items-center" href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#editResellerModal"
                    data-id="${reseller.id}"
                    data-info='${JSON.stringify(reseller)}'>
                    <i class="ti ti-pencil me-2 text-warning"></i> Edit
                </a>
            </li>
            <li>
                <a class="dropdown-item d-flex align-items-center" href="#"
                    onclick="toggleResellerStatus(${reseller.id}, '${reseller.username}')">
                    <i class="ti ${reseller.is_active ? 'ti-lock text-danger' : 'ti-lock-open text-success'} me-2"></i>
                    ${reseller.is_active ? 'Block' : 'Activate'}
                </a>
            </li>
            <li>
                <a class="dropdown-item d-flex align-items-center text-danger" href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteResellerModal"
                    data-id="${reseller.id}"
                    data-username="${reseller.username}">
                    <i class="ti ti-trash me-2"></i> Delete
                </a>
            </li>
        </ul>
    </div>`;
}

// Funzioni di utilità
function findRowIndex(resellerId) {
    return dataTable.rows().indexes().filter(idx => {
        const rowData = dataTable.row(idx).nodes().to$();
        return rowData.find(`[data-id="${resellerId}"]`).length > 0;
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

// Gestione Status Reseller
function toggleResellerStatus(resellerId, username) {
    toggleLoading(true);

    fetch(`/resellers/${resellerId}/toggle-status`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateTable(data.reseller, 'update');
                showToast(data.message, 'success');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            showToast('Error updating reseller status', 'danger');
            console.error('Error:', error);
        })
        .finally(() => {
            toggleLoading(false);
        });
}

// Event Listeners
function attachEventListeners() {
    // Modal Edit
    $(document).on('show.bs.modal', '#editResellerModal', function (event) {
        const button = $(event.relatedTarget);
        try {
            const info = JSON.parse(button.attr('data-info'));
            const form = document.getElementById('editResellerForm');
            form.action = `/resellers/${info.id}`;
            document.getElementById('edit_username').value = info.username;
            document.getElementById('edit_notes').value = info.notes || '';
            document.getElementById('edit_password').value = '';

            // Aggiorna il ruolo solo se l'elemento esiste (ovvero se l'utente ha il permesso)
            const roleSelect = document.getElementById('edit_role_id');
            if (roleSelect) {
                roleSelect.value = info.role.id;
            }
        } catch (error) {
            console.error('Error parsing reseller info:', error);
            showToast('Error loading reseller data', 'danger');
        }
    });

    // Modal Delete
    $(document).on('show.bs.modal', '#deleteResellerModal', function (event) {
        const button = $(event.relatedTarget);
        const resellerId = button.data('id');
        const resellerName = button.data('username');

        const form = document.getElementById('deleteResellerForm');
        form.action = `/resellers/${resellerId}`;
        document.getElementById('deleteResellerName').textContent = resellerName;

        // Reset warnings
        $('#dependenciesWarning, #descendantsWarning, #usersWarning').addClass('d-none');
        $('#descendantsList').empty();

        // Verifica dipendenze
        fetch(`/resellers/${resellerId}/check-dependencies`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const hasWarnings = data.descendantsCount > 0 || data.usersCount > 0;
                    $('#dependenciesWarning').toggleClass('d-none', !hasWarnings);

                    if (data.descendantsCount > 0) {
                        $('#descendantsWarning').removeClass('d-none');
                        $('#descendantsCount').text(data.descendantsCount);

                        // Popolamento lista discendenti
                        const list = $('#descendantsList');
                        data.descendants.forEach(descendant => {
                            list.append(`<li>${descendant.username}</li>`);
                        });
                    }

                    if (data.usersCount > 0) {
                        $('#usersWarning').removeClass('d-none');
                        $('#usersCount').text(data.usersCount);
                    }
                }
            })
            .catch(error => {
                console.error('Error checking dependencies:', error);
            });
    });

    // Modal Recharge
    $(document).on('show.bs.modal', '#rechargeModal', function (event) {
        const button = $(event.relatedTarget);
        const resellerId = button.data('id');
        const resellerName = button.data('username');
        const form = document.getElementById('rechargeForm');
        form.action = `/resellers/${resellerId}/recharge`;
        document.getElementById('rechargeResellerName').textContent = resellerName;
        document.getElementById('recharge_amount').value = '';

        if (!checkUnlimitedCredits()) {
            const creditsElement = document.getElementById('userCredits');
            const currentCredits = parseInt(creditsElement.textContent.match(/\d+/)[0]);
            if (!isNaN(currentCredits)) {
                updateNavbarCredits(currentCredits);
            }
        }
    });

    // Modal Add
    $(document).on('show.bs.modal', '#addResellerModal', function () {
        if (!checkUnlimitedCredits()) {
            const creditsElement = document.getElementById('userCredits');
            const currentCredits = parseInt(creditsElement.textContent.match(/\d+/)[0]);
            if (!isNaN(currentCredits)) {
                updateNavbarCredits(currentCredits);
            }
        }
    });
}

// Form Listeners
function initializeFormListeners() {
    // Add Form
    $('#addResellerForm').on('submit', function (e) {
        e.preventDefault();
        handleFormSubmit(this, 'add');
    });

    // Edit Form
    $('#editResellerForm').on('submit', function (e) {
        e.preventDefault();
        handleFormSubmit(this, 'update');
    });

    // Delete Form
    $('#deleteResellerForm').on('submit', function (e) {
        e.preventDefault();
        handleFormSubmit(this, 'delete');
    });

    // Recharge Form
    $('#rechargeForm').on('submit', function (e) {
        e.preventDefault();
        handleFormSubmit(this, 'recharge');
    });
}

// Form Submission Handler
// In resellers.js

function handleFormSubmit(form, action) {
    toggleLoading(true);
    const formData = new FormData(form);

    if (action === 'update' || action === 'delete') {
        formData.append('_method', action === 'update' ? 'PUT' : 'DELETE');
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (action === 'delete') {
                    // Rimuovi il reseller principale
                    const mainRow = dataTable.row($(`[data-id="${data.resellerId}"]`).closest('tr'));
                    if (mainRow) {
                        mainRow.remove();
                    }

                    // Rimuovi tutti i discendenti
                    if (data.descendantIds && data.descendantIds.length > 0) {
                        data.descendantIds.forEach(id => {
                            const descendantRow = dataTable.row($(`[data-id="${id}"]`).closest('tr'));
                            if (descendantRow) {
                                descendantRow.remove();
                            }
                        });
                    }

                    // Ridisegna la tabella e aggiorna gli indici
                    dataTable.rows().every(function (rowIdx) {
                        const data = this.data();
                        data[0] = rowIdx + 1;
                        this.data(data);
                    });
                    dataTable.draw();
                } else {
                    // Gestione degli altri casi (add, update, recharge)
                    if (data.reseller) {
                        if (action === 'recharge') {
                            // Per recharge usiamo 'update' perché vogliamo aggiornare la riga esistente
                            updateTable(data.reseller, 'update');
                        } else {
                            updateTable(data.reseller, action);
                        }
                    }
                }

                if (data.userCredits) {
                    updateNavbarCredits(data.userCredits);
                }

                showToast(data.message, 'success');
                $(form).closest('.modal').modal('hide');

                if (action === 'add') {
                    form.reset();
                }
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('An error occurred while processing your request', 'danger');
        })
        .finally(() => {
            toggleLoading(false);
        });
}
