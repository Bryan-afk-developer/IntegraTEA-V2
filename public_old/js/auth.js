// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMsg = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');

    function toggleAdminPanelVisibility(showAdmin) {
        document.getElementById('login-section').classList.toggle('hidden', showAdmin);
        document.getElementById('admin-panel-section').classList.toggle('hidden', !showAdmin);
    }

    // Adaptado: Ahora envía credenciales a la API de Express
    async function handleLogin(e) {
        e.preventDefault();
        loginErrorMsg.classList.add('hidden');

        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Si el login es exitoso, guarda el token y el nombre del usuario
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userName', data.educator.firstName);
                window.location.hash = '#dashboard';
                window.location.reload(); // Recarga para que main.js inicialice el panel
            } else {
                loginErrorMsg.textContent = data.message || 'Error desconocido al iniciar sesión';
                loginErrorMsg.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error de red o del servidor:', error);
            loginErrorMsg.textContent = 'Error de conexión. Inténtalo de nuevo.';
            loginErrorMsg.classList.remove('hidden');
        }
    }

    // Permanece igual: Limpia localStorage y recarga
    function handleLogout() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userName');
        window.location.hash = '';
        window.location.reload();
    }

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    window.auth = {
        toggleAdminPanelVisibility,
        handleLogout
    };
});