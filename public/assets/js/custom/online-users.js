let dataTable;

function initializeDataTable() {
    if (dataTable) {
        dataTable.destroy();
    }

    dataTable = $('#onlineUsersTable').DataTable({
        responsive: true,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        language: {
            emptyTable: "No users currently streaming",
            lengthMenu: "Show _MENU_",
            search: "",
            searchPlaceholder: "Search...",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            infoEmpty: "Showing 0 to 0 of 0 entries",
            zeroRecords: "No matching records found"
        },
        order: [[0, 'asc']]
    });
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

function refreshTable() {
    const btn = $('#refreshBtn');
    const originalContent = btn.html();

    btn.html('<i class="ti ti-loader ti-spin me-1"></i> Loading...').prop('disabled', true);

    $.ajax({
        url: '/users/online',
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (response) {
            $('#tableContainer').html(response);
            initializeDataTable();
        },
        error: function () {
            showToast('Error refreshing data', 'danger');
        },
        complete: function () {
            btn.html(originalContent).prop('disabled', false);
        }
    });
}

$(document).ready(function () {
    initializeDataTable();

    $('#refreshBtn').on('click', function () {
        refreshTable();
    });
});
