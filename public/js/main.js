// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const adminPanelSection = document.getElementById('admin-panel-section');
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const welcomeUserSpan = document.getElementById('welcome-user');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    const dashboardLink = document.getElementById('dashboard-link');
    const usersManagementLink = document.getElementById('users-management-link');
    const activitiesLink = document.getElementById('activities-link');

    function setActiveLink(activeId) {
        [dashboardLink, usersManagementLink, activitiesLink].forEach(link => {
            if (link) {
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
                <p class="content-text">Navega a las secciones de la izquierda para empezar.</p>
            </div>
        `;
        setActiveLink('dashboard-link');
    }

    // ELIMINAMOS LA FUNCIÓN renderActivitiesPage() (placeholder)

    function handleRouting() {
        const hash = window.location.hash;
        if (!window.appUtils.getToken()) {
            window.location.hash = '';
            window.auth.toggleAdminPanelVisibility(false);
            return;
        }

        if (hash === '#users' && window.usersManagement) {
            window.usersManagement.renderUsersManagementPage();
            setActiveLink('users-management-link');
        
        // --- INICIO DE LA MODIFICACIÓN ---
        } else if (hash === '#activities' && window.activitiesManagement) {
            // Ya no llama al placeholder, sino al módulo real
            window.activitiesManagement.renderActivitiesManagementPage();
            setActiveLink('activities-link');
        // --- FIN DE LA MODIFICACIÓN ---
        
        } else if (hash === '#dashboard') {
            renderDashboard();
        
        } else {
            // Si el hash no coincide con ninguna ruta conocida, redirigir al dashboard
            window.location.hash = '#dashboard';
            renderDashboard();
        }

        // Cierra el sidebar en pantallas móviles después de la navegación
        if (sidebar && sidebar.classList.contains('sidebar-open')) {
             sidebar.classList.remove('sidebar-open');
        }
    }

    // Listener para el botón de toggle del sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
        });
    }

    // Listener para cambios en el hash de la URL (navegación SPA)
    window.addEventListener('hashchange', handleRouting);

    // Comprobar autenticación y renderizar la vista inicial al cargar la página
    checkAuthAndRender();
});

