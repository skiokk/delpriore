document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('changePasswordForm');

    // Password visibility toggle
    document.querySelectorAll('.input-group-text').forEach(toggle => {
        toggle.addEventListener('click', e => {
            const icon = toggle.querySelector('.ti');
            const input = toggle.parentNode.querySelector('input');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ti-eye-off');
                icon.classList.add('ti-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('ti-eye');
                icon.classList.add('ti-eye-off');
            }
        });
    });

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

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validazione lato client
        const password = document.getElementById('password').value;
        const confirmation = document.getElementById('password_confirmation').value;

        if (password.length < 6) {
            showToast('The password must be at least 6 characters.', 'danger');
            return;
        }

        if (password !== confirmation) {
            showToast('The password confirmation does not match.', 'danger');
            return;
        }

        fetch(this.action, {
            method: 'POST',
            body: new FormData(this),
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
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
                    showToast(data.message, 'success');
                    form.reset();
                } else {
                    showToast(data.message || 'An error occurred while updating the password', 'danger');
                }
            })
            .catch(error => {
                if (error.errors) {
                    const messages = Object.values(error.errors).flat();
                    messages.forEach(message => showToast(message, 'danger'));
                } else {
                    showToast('An error occurred while processing your request', 'danger');
                }
                console.error('Error:', error);
            });
    });
});
