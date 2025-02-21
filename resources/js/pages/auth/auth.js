// resources/js/pages/auth/auth.js
export function initializeAuth() {
    // Toggle password visibility
    const togglePassword = document.querySelector('.input-group-text');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('ti-eye');
            this.querySelector('i').classList.toggle('ti-eye-off');
        });
    }
}
