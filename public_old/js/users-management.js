// public/js/users-management.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const crudModal = document.getElementById('crud-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    let currentUserId = null;    // Para el ID del usuario (Educador o Niño) en edición
    let currentUserRole = null;  // Para saber qué tipo de usuario se está editando

    // --- Funciones de la API para Educadores ---
    async function fetchEducators() {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/educators`, {
                headers: window.appUtils.getAuthHeaders()
            });
            if (!response.ok) {
                if (response.status === 401) { window.auth.handleLogout(); }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const educators = await response.json();
            return educators.map(e => ({ ...e, role: 'Educador' }));
        } catch (error) {
            console.error('Error fetching educators:', error);
            alert('Error al cargar educadores: ' + error.message);
            return [];
        }
    }

    async function createEducator(educatorData) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/educators`, {
                method: 'POST',
                headers: window.appUtils.getAuthHeaders(),
                body: JSON.stringify(educatorData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating educator:', error);
            throw error;
        }
    }

    async function updateEducator(id, educatorData) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/educators/${id}`, {
                method: 'PUT',
                headers: window.appUtils.getAuthHeaders(),
                body: JSON.stringify(educatorData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating educator:', error);
            throw error;
        }
    }

    async function deleteEducatorAPI(id) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/educators/${id}`, {
                method: 'DELETE',
                headers: window.appUtils.getAuthHeaders()
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error deleting educator:', error);
            throw error;
        }
    }

    // --- Funciones de la API para Niños ---
    async function fetchChildren() {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/children`, {
                headers: window.appUtils.getAuthHeaders()
            });
            if (!response.ok) {
                if (response.status === 401) { window.auth.handleLogout(); }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const children = await response.json();
            return children.map(child => ({
                _id: child._id,
                firstName: child.firstName,
                lastName: child.lastName,
                age: child.age,
                educatorId: child.educatorId,
                createdAt: child.createdAt,
                role: 'Niño'
            }));
        } catch (error) {
            console.error('Error fetching children:', error);
            alert('Error al cargar niños: ' + error.message);
            return [];
        }
    }

    async function createChild(childData) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/children`, {
                method: 'POST',
                headers: window.appUtils.getAuthHeaders(),
                body: JSON.stringify(childData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating child:', error);
            throw error;
        }
    }

    async function updateChild(id, childData) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/children/${id}`, {
                method: 'PUT',
                headers: window.appUtils.getAuthHeaders(),
                body: JSON.stringify(childData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating child:', error);
            throw error;
        }
    }

    async function deleteChildAPI(id) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/children/${id}`, {
                method: 'DELETE',
                headers: window.appUtils.getAuthHeaders()
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error deleting child:', error);
            throw error;
        }
    }

    // --- Renderizado y Lógica del Frontend para Gestión de Usuarios ---
    async function renderUsersManagementPage() {
        mainContent.innerHTML = `
            <div class="content-card">
                <h2 class="content-card-title">Gestión de Usuarios</h2>

                <div class="filters-actions-container">
                    <input type="text" id="filter-name-role" placeholder="Buscar por nombre o rol..."
                           class="filter-input">
                    <button id="add-user-btn" class="btn-add-user">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
                        Agregar Usuario
                    </button>
                </div>

                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Rol</th>
                                <th>Fecha de Creación</th>
                                <th class="actions-cell">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- Filas de usuarios se inyectarán aquí -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        // Adjuntar el listener de delegación de eventos al tbody
        document.getElementById('users-table-body').addEventListener('click', handleTableActionClick);

        await loadUsersAndRenderTable();
        addEventListenersToUserPage();
    }

    async function loadUsersAndRenderTable(filters = {}) {
        const [educators, children] = await Promise.all([
            fetchEducators(),
            fetchChildren()
        ]);

        let allUsers = [...educators, ...children];

        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        // Lógica de filtrado en el frontend
        if (filters.nameRole) {
            const searchTerm = filters.nameRole.toLowerCase();
            allUsers = allUsers.filter(u =>
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm) ||
                (u.role && u.role.toLowerCase().includes(searchTerm))
            );
        }

        tableBody.innerHTML = '';
        if (allUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">No se encontraron usuarios.</td></tr>`;
            return;
        }

        allUsers.forEach(user => {
            const row = document.createElement('tr');
            const roleBadgeClass = user.role === 'Educador' ? 'badge-educator' : 'badge-child';
            const formattedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';

            row.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td><span class="badge ${roleBadgeClass}">${user.role}</span></td>
                <td>${formattedDate}</td>
                <td class="actions-cell">
                    <button data-id="${user._id.toString()}" data-role="${user.role}" class="edit-btn icon-btn">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487zm0 0L19.5 7.125"></path></svg>
                    </button>
                    <button data-id="${user._id.toString()}" data-role="${user.role}" class="delete-btn icon-btn">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.927a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165L5.677 19.673a2.25 2.25 0 002.244 2.077h7.128a2.25 2.25 0 002.244-2.077L19.58 5.79m-4.026 0c.182.025.364.05.546.075M9.26 5.79c.182.025.364.05.546.075"></path></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // NOTA: Los listeners de los botones se manejan con delegación de eventos en handleTableActionClick,
        // no se adjuntan aquí directamente.
    }

    // Función de delegación de eventos para la tabla
    function handleTableActionClick(e) {
        const targetButton = e.target.closest('.edit-btn, .delete-btn'); // Encontrar el botón más cercano
        if (!targetButton) return; // Si no se hizo clic en un botón de acción, ignorar

        const id = targetButton.dataset.id;
        const role = targetButton.dataset.role;

        if (targetButton.classList.contains('edit-btn')) {
            currentUserId = id;
            currentUserRole = role;
            openUserForm(currentUserId, currentUserRole);
        } else if (targetButton.classList.contains('delete-btn')) {
            confirmDeleteUser(id, role);
        }
    }

    function addEventListenersToUserPage() {
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) addUserBtn.addEventListener('click', openUserTypeSelectionModal);

        const filterNameRole = document.getElementById('filter-name-role');

        const applyFilters = () => {
            const filters = {
                nameRole: filterNameRole.value
            };
            loadUsersAndRenderTable(filters);
        };

        if (filterNameRole) filterNameRole.addEventListener('input', applyFilters);
    }

    // Modal de selección de tipo de usuario (sin cambios)
    function openUserTypeSelectionModal() {
        currentUserId = null;
        currentUserRole = null;

        modalTitle.textContent = 'Seleccionar Tipo de Usuario';
        modalBody.innerHTML = `
            <p class="modal-text">¿Qué tipo de usuario deseas agregar?</p>
            <div class="form-actions" style="justify-content: center; margin-top: 2rem;">
                <button type="button" id="select-educator-btn" class="btn btn-primary" style="margin-right: 1rem;">Agregar Educador</button>
                <button type="button" id="select-child-btn" class="btn btn-info">Agregar Niño</button>
            </div>
            <p id="selection-error-msg" class="error-message hidden"></p>
        `;
        crudModal.classList.remove('hidden');

        document.getElementById('select-educator-btn').addEventListener('click', () => openUserForm(null, 'Educador'));
        document.getElementById('select-child-btn').addEventListener('click', () => openUserForm(null, 'Niño'));
    }

    // openUserForm (sin cambios de lógica, solo asegúrate de que currentUserId y currentUserRole se usen correctamente)
    async function openUserForm(id = null, role) {
        currentUserId = id; // Para edición
        currentUserRole = role; // Para saber qué formulario renderizar y qué API llamar

        let userData = {};
        let allEducators = [];

        modalTitle.textContent = `${id ? 'Editar' : 'Añadir'} ${role}`;

        if (id) {
            try {
                const url = role === 'Educador' ? `${window.appUtils.API_BASE_URL}/api/educators/${id}` : `${window.appUtils.API_BASE_URL}/api/children/${id}`;
                const response = await fetch(url, { headers: window.appUtils.getAuthHeaders() });

                if (!response.ok) {
                     if (response.status === 401) window.auth.handleLogout();
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                userData = await response.json();
            } catch (error) {
                console.error(`Error fetching single ${role.toLowerCase()}:`, error);
                alert(`No se pudo cargar la información del ${role.toLowerCase()}: ` + error.message);
                return;
            }
        }

        if (role === 'Niño') {
            try {
                const educatorsResponse = await fetchEducators();
                allEducators = educatorsResponse;
            } catch (error) {
                console.error('Error fetching educators for child form:', error);
                alert('No se pudieron cargar los educadores para el formulario del niño.');
                return;
            }
        }

        if (role === 'Educador') {
            modalBody.innerHTML = `
                <form id="user-form" class="form-grid">
                    <div class="form-group">
                        <label for="firstName">Nombre</label>
                        <input type="text" id="firstName" name="firstName" value="${userData.firstName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Apellido</label>
                        <input type="text" id="lastName" name="lastName" value="${userData.lastName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="${userData.email || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="school">Escuela</label>
                        <input type="text" id="school" name="school" value="${userData.school || ''}" required>
                    </div>
                    ${!id ? `
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                    ` : `
                        <div class="form-group">
                            <label for="password">Nueva Contraseña (opcional)</label>
                            <input type="password" id="password" name="password">
                        </div>
                    `}
                    <p id="form-error-msg" class="error-message hidden"></p>
                    <div class="form-actions">
                        <button type="button" id="cancel-form-btn" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            `;
        } else if (role === 'Niño') {
            modalBody.innerHTML = `
                <form id="user-form" class="form-grid">
                    <div class="form-group">
                        <label for="firstName">Nombre</label>
                        <input type="text" id="firstName" name="firstName" value="${userData.firstName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Apellido</label>
                        <input type="text" id="lastName" name="lastName" value="${userData.lastName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="age">Edad</label>
                        <input type="number" id="age" name="age" value="${userData.age || ''}" required min="0" max="18">
                    </div>
                    <div class="form-group">
                        <label for="educatorId">Educador Asignado</label>
                        <select id="educatorId" name="educatorId" required class="form-control">
                            <option value="">-- Selecciona un Educador --</option>
                            ${allEducators.map(educator => `
                                <option value="${educator._id}" ${userData.educatorId && userData.educatorId.toString() === educator._id.toString() ? 'selected' : ''}>
                                    ${educator.firstName} ${educator.lastName} (${educator.school})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <p id="form-error-msg" class="error-message hidden"></p>
                    <div class="form-actions">
                        <button type="button" id="cancel-form-btn" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            `;
        } else {
            document.getElementById('selection-error-msg').textContent = 'Tipo de usuario no reconocido.';
            document.getElementById('selection-error-msg').classList.remove('hidden');
            return;
        }
        
        crudModal.classList.remove('hidden');

        document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
        document.getElementById('cancel-form-btn').addEventListener('click', closeUserModal);
    }

    async function handleUserFormSubmit(e) {
        e.preventDefault();
        const formErrorMsg = document.getElementById('form-error-msg');
        formErrorMsg.classList.add('hidden');

        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());

        if (currentUserRole === 'Educador' && currentUserId && !userData.password) {
            delete userData.password;
        }
        if (currentUserRole === 'Niño') {
            userData.age = parseInt(userData.age);
        }

        try {
            if (currentUserRole === 'Educador') {
                if (currentUserId) {
                    await updateEducator(currentUserId, userData);
                    alert('Educador actualizado con éxito!');
                } else {
                    await createEducator(userData);
                    alert('Educador añadido con éxito!');
                }
            } else if (currentUserRole === 'Niño') {
                if (currentUserId) {
                    await updateChild(currentUserId, userData);
                    alert('Niño actualizado con éxito!');
                } else {
                    await createChild(userData);
                    alert('Niño añadido con éxito!');
                }
            }
            closeUserModal();
            await loadUsersAndRenderTable();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            formErrorMsg.textContent = error.message || 'Error del servidor al guardar.';
            formErrorMsg.classList.remove('hidden');
        }
    }

    // confirmDeleteUser (sin cambios de lógica)
    function confirmDeleteUser(idToDelete, roleToDelete) {
        console.log(`ID del usuario para eliminar (confirmación - recibido): ${idToDelete}, Rol: ${roleToDelete}`);

        modalTitle.textContent = 'Confirmar Eliminación';
        modalBody.innerHTML = `
            <p class="modal-text">¿Estás seguro de que deseas eliminar a este usuario (${roleToDelete})?</p>
            <div class="form-actions">
                <button type="button" id="cancel-delete-btn" class="btn btn-secondary">Cancelar</button>
                <button type="button" id="confirm-delete-btn" class="btn btn-danger" data-id-to-delete="${idToDelete}" data-role-to-delete="${roleToDelete}">Eliminar</button>
            </div>
        `;
        crudModal.classList.remove('hidden');

        document.getElementById('confirm-delete-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.idToDelete;
            const role = e.currentTarget.dataset.roleToDelete;
            console.log(`Intentando eliminar ${role} con ID (del botón de confirmación): ${id}`);

            try {
                if (role === 'Educador') {
                    await deleteEducatorAPI(id);
                    alert('Educador eliminado correctamente!');
                } else if (role === 'Niño') {
                    await deleteChildAPI(id);
                    alert('Niño eliminado correctamente!');
                }
                closeUserModal();
                await loadUsersAndRenderTable();
            } catch (error) {
                alert(`Error al eliminar ${role.toLowerCase()}: ` + (error.message || error));
            }
        });
        document.getElementById('cancel-delete-btn').addEventListener('click', closeUserModal);
    }

    function closeUserModal() {
        crudModal.classList.add('hidden');
        modalBody.innerHTML = '';
        currentUserId = null;
        currentUserRole = null;
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeUserModal);
    crudModal.addEventListener('click', (e) => {
        if (e.target === crudModal) {
            closeUserModal();
        }
    });

    window.usersManagement = {
        renderUsersManagementPage
    };
});