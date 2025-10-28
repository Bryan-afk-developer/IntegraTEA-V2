// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const adminPanelSection = document.getElementById('admin-panel-section');
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const welcomeUserSpan = document.getElementById('welcome-user');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    // Referencias a los enlaces del sidebar para manejar la clase 'active'
    const dashboardLink = document.getElementById('dashboard-link');
    const usersManagementLink = document.getElementById('users-management-link');
    const activitiesLink = document.getElementById('activities-link'); // Nuevo enlace

    function setActiveLink(activeId) {
        [dashboardLink, usersManagementLink, activitiesLink].forEach(link => {
            if (link) { // Asegurarse de que el elemento existe
                if (link.id === activeId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    function checkAuthAndRender() {
        const token = window.appUtils.getToken();
        const userName = localStorage.getItem('userName');

        if (token && userName) {
            window.auth.toggleAdminPanelVisibility(true);
            if (welcomeUserSpan) welcomeUserSpan.textContent = `Bienvenido, ${userName}`;
            handleRouting();
        } else {
            window.auth.toggleAdminPanelVisibility(false);
            window.location.hash = '';
        }
    }

    function renderDashboard() {
        mainContent.innerHTML = `
            <div class="content-card">
                <h2 class="content-card-title">Panel de Control (Dashboard)</h2>
                <p class="content-text">Bienvenido al panel de administración de IntegraTEA.</p>
                <p class="content-text">Navega a la sección de Gestionar Usuarios para empezar.</p>
            </div>
        `;
        setActiveLink('dashboard-link'); // Marcar Dashboard como activo
    }

    function renderActivitiesPage() {
        mainContent.innerHTML = `
            <div class="content-card">
                <h2 class="content-card-title">Gestión de Actividades</h2>
                <p class="content-text">Aquí se gestionarán las actividades.</p>
                <p class="content-text">¡Este módulo está en construcción!</p>
            </div>
        `;
        setActiveLink('activities-link'); // Marcar Actividades como activo
    }


    function handleRouting() {
        const hash = window.location.hash;
        if (!window.appUtils.getToken()) {
            window.location.hash = '';
            window.auth.toggleAdminPanelVisibility(false);
            return;
        }

        if (hash === '#users' && window.usersManagement) { // CAMBIO: Hash y módulo
            window.usersManagement.renderUsersManagementPage();
            setActiveLink('users-management-link'); // Marcar Gestionar Usuarios como activo
        } else if (hash === '#dashboard') {
            renderDashboard();
        } else if (hash === '#activities') { // NUEVO: Ruta para actividades
            renderActivitiesPage();
        }
        else {
            window.location.hash = '#dashboard';
            renderDashboard();
        }

        if (sidebar && sidebar.classList.contains('sidebar-open')) {
             sidebar.classList.remove('sidebar-open');
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
        });
    }

    window.addEventListener('hashchange', handleRouting);

    checkAuthAndRender();
});