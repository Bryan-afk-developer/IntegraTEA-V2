// public/js/activities-management.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const crudModal = document.getElementById('crud-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    let currentActivityId = null;
    let allChildren = []; // Cache para guardar niños
    let allPictograms = []; // Cache para guardar pictogramas

    // --- Funciones de la API para Actividades ---
    async function fetchActivities() {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/activities`, {
                headers: window.appUtils.getAuthHeaders()
            });
            if (!response.ok) {
                if (response.status === 401) { window.auth.handleLogout(); }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching activities:', error);
            alert('Error al cargar actividades: ' + error.message);
            return [];
        }
    }

    async function createActivity(activityData) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/activities`, {
                method: 'POST',
                headers: window.appUtils.getAuthHeaders(),
                body: JSON.stringify(activityData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating activity:', error);
            throw error;
        }
    }

    async function updateActivity(id, activityData) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/activities/${id}`, {
                method: 'PUT',
                headers: window.appUtils.getAuthHeaders(),
                body: JSON.stringify(activityData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    }

    async function deleteActivityAPI(id) {
        try {
            const response = await fetch(`${window.appUtils.API_BASE_URL}/api/activities/${id}`, {
                method: 'DELETE',
                headers: window.appUtils.getAuthHeaders()
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    }

    // --- Funciones auxiliares para el formulario ---
    async function fetchFormDependencies() {
        try {
            // Solo fetchear si el cache está vacío
            if (allChildren.length === 0) {
                const childrenResponse = await fetch(`${window.appUtils.API_BASE_URL}/api/children`, { headers: window.appUtils.getAuthHeaders() });
                if (!childrenResponse.ok) throw new Error('Failed to fetch children');
                allChildren = await childrenResponse.json();
            }
            if (allPictograms.length === 0) {
                const pictogramsResponse = await fetch(`${window.appUtils.API_BASE_URL}/api/pictograms`, { headers: window.appUtils.getAuthHeaders() });
                if (!pictogramsResponse.ok) throw new Error('Failed to fetch pictograms');
                allPictograms = await pictogramsResponse.json();
            }
        } catch (error) {
            console.error('Error fetching form dependencies:', error);
            alert('Error al cargar datos para el formulario: ' + error.message);
        }
    }

    // --- Renderizado y Lógica del Frontend ---
    async function renderActivitiesManagementPage() {
        mainContent.innerHTML = `
            <div class="content-card">
                <h2 class="content-card-title">Gestión de Actividades</h2>

                <div class="filters-actions-container">
                    <input type="text" id="filter-activities" placeholder="Buscar por niño o estado..."
                           class="filter-input">
                    <button id="add-activity-btn" class="btn-add-user" style="background-color: var(--green-primary);">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
                        Asignar Actividad
                    </button>
                </div>

                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Niño Asignado</th>
                                <th>Educador</th>
                                <th>Estado</th>
                                <th>Puntuación</th>
                                <th>Fecha Creación</th>
                                <th class="actions-cell">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="activities-table-body">
                            <!-- Filas de actividades se inyectarán aquí -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('activities-table-body').addEventListener('click', handleTableActionClick);

        await loadActivitiesAndRenderTable();
        addEventListenersToActivityPage();
    }

    async function loadActivitiesAndRenderTable(filters = {}) {
        let activities = await fetchActivities();
        const tableBody = document.getElementById('activities-table-body');
        if (!tableBody) return;

        // Lógica de filtrado
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            activities = activities.filter(act =>
                (act.childId.firstName.toLowerCase().includes(searchTerm) || act.childId.lastName.toLowerCase().includes(searchTerm)) ||
                (act.status && act.status.toLowerCase().includes(searchTerm))
            );
        }

        tableBody.innerHTML = '';
        if (activities.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No se encontraron actividades.</td></tr>`;
            return;
        }

        activities.forEach(activity => {
            const row = document.createElement('tr');
            const childName = activity.childId ? `${activity.childId.firstName} ${activity.childId.lastName}` : 'Niño no encontrado';
            const educatorName = activity.educatorId ? `${activity.educatorId.firstName} ${activity.educatorId.lastName}` : 'Educador no encontrado';
            const statusBadge = activity.status === 'completada' ? 'badge-educator' : 'badge-child'; // Reusamos clases
            const formattedDate = new Date(activity.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const score = activity.score !== null && activity.score !== undefined ? `${activity.score}%` : 'N/A';

            row.innerHTML = `
                <td>${childName}</td>
                <td>${educatorName}</td>
                <td><span class="badge ${statusBadge}">${activity.status}</span></td>
                <td>${score}</td>
                <td>${formattedDate}</td>
                <td class="actions-cell">
                    <button data-id="${activity._id}" class="edit-btn icon-btn">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487zm0 0L19.5 7.125"></path></svg>
                    </button>
                    <button data-id="${activity._id}" class="delete-btn icon-btn">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.927a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165L5.677 19.673a2.25 2.25 0 002.244 2.077h7.128a2.25 2.25 0 002.244-2.077L19.58 5.79m-4.026 0c.182.025.364.05.546.075M9.26 5.79c.182.025.364.05.546.075"></path></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function handleTableActionClick(e) {
        const targetButton = e.target.closest('.edit-btn, .delete-btn');
        if (!targetButton) return;

        const id = targetButton.dataset.id;
        if (targetButton.classList.contains('edit-btn')) {
            openActivityForm(id);
        } else if (targetButton.classList.contains('delete-btn')) {
            confirmDeleteActivity(id);
        }
    }

    function addEventListenersToActivityPage() {
        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) addActivityBtn.addEventListener('click', () => openActivityForm(null));

        const filterInput = document.getElementById('filter-activities');
        if (filterInput) filterInput.addEventListener('input', (e) => {
            loadActivitiesAndRenderTable({ searchTerm: e.target.value });
        });
    }

    async function openActivityForm(id = null) {
        currentActivityId = id;
        let activityData = {};

        // Cargar niños y pictogramas para los dropdowns
        await fetchFormDependencies();

        if (id) {
            try {
                const response = await fetch(`${window.appUtils.API_BASE_URL}/api/activities/${id}`, { headers: window.appUtils.getAuthHeaders() });
                if (!response.ok) throw new Error('No se pudo cargar la actividad');
                activityData = await response.json();
            } catch (error) {
                alert('Error al cargar datos de la actividad: ' + error.message);
                return;
            }
        }

        modalTitle.textContent = `${id ? 'Editar' : 'Asignar'} Actividad`;
        modalBody.innerHTML = `
            <form id="activity-form" class="form-grid">
                <div class="form-group">
                    <label for="childId">Asignar a Niño</label>
                    <select id="childId" name="childId" required class="form-control">
                        <option value="">-- Selecciona un Niño --</option>
                        ${allChildren.map(child => `
                            <option value="${child._id}" ${activityData.childId && activityData.childId._id === child._id ? 'selected' : ''}>
                                ${child.firstName} ${child.lastName}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="status">Estado</label>
                    <select id="status" name="status" required class="form-control">
                        <option value="asignada" ${activityData.status === 'asignada' ? 'selected' : ''}>Asignada</option>
                        <option value="completada" ${activityData.status === 'completada' ? 'selected' : ''}>Completada</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="score">Puntuación (si está completada)</label>
                    <input type="number" id="score" name="score" value="${activityData.score || ''}" min="0" max="100">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Pictogramas (Selecciona 6)</label>
                    <div id="pictogram-selector-list" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-gray); border-radius: 0.375rem; padding: 0.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem;">
                        ${allPictograms.map(p => `
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 0.25rem; border-radius: 0.25rem;">
                                <input type="checkbox" name="pictogramIds" value="${p._id}" 
                                    ${activityData.pictogramIds && activityData.pictogramIds.some(pid => pid._id === p._id) ? 'checked' : ''}
                                    style="margin-bottom: 0.25rem;">
                                <img src="${p.imageUrl || `https://placehold.co/80x80/EEE/31343C?text=${encodeURIComponent(p.name)}`}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.25rem;">
                                <span style="font-size: 0.75rem; text-align: center;">${p.name}</span>
                            </label>
                        `).join('')}
                    </div>
                    <small>Selecciona los pictogramas para la actividad.</small>
                </div>

                <p id="form-error-msg" class="error-message hidden"></p>
                <div class="form-actions">
                    <button type="button" id="cancel-form-btn" class="btn btn-secondary">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `;
        
        crudModal.classList.remove('hidden');
        document.getElementById('activity-form').addEventListener('submit', handleActivityFormSubmit);
        document.getElementById('cancel-form-btn').addEventListener('click', closeActivityModal);
    }

    async function handleActivityFormSubmit(e) {
        e.preventDefault();
        const formErrorMsg = document.getElementById('form-error-msg');
        formErrorMsg.classList.add('hidden');

        const formData = new FormData(e.target);
        
        // Manejar pictogramIds (checkboxes)
        const pictogramIds = formData.getAll('pictogramIds');
        
        const activityData = {
            childId: formData.get('childId'),
            status: formData.get('status'),
            score: formData.get('score') ? parseInt(formData.get('score')) : null,
            pictogramIds: pictogramIds
        };

        if (activityData.status === 'asignada') {
            activityData.score = null; // No guardar puntuación si solo está asignada
        }

        try {
            if (currentActivityId) {
                await updateActivity(currentActivityId, activityData);
                alert('Actividad actualizada con éxito!');
            } else {
                await createActivity(activityData);
                alert('Actividad asignada con éxito!');
            }
            closeActivityModal();
            await loadActivitiesAndRenderTable();
        } catch (error) {
            console.error('Error al guardar actividad:', error);
            formErrorMsg.textContent = error.message || 'Error del servidor al guardar.';
            formErrorMsg.classList.remove('hidden');
        }
    }

    function confirmDeleteActivity(id) {
        modalTitle.textContent = 'Confirmar Eliminación';
        modalBody.innerHTML = `
            <p class="modal-text">¿Estás seguro de que deseas eliminar esta actividad?</p>
            <div class="form-actions">
                <button type="button" id="cancel-delete-btn" class="btn btn-secondary">Cancelar</button>
                <button type="button" id="confirm-delete-btn" class="btn btn-danger">Eliminar</button>
            </div>
        `;
        crudModal.classList.remove('hidden');

        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            try {
                await deleteActivityAPI(id);
                alert('Actividad eliminada correctamente!');
                closeActivityModal();
                await loadActivitiesAndRenderTable();
            } catch (error) {
                alert('Error al eliminar actividad: ' + (error.message || error));
            }
        });
        document.getElementById('cancel-delete-btn').addEventListener('click', closeActivityModal);
    }

    function closeActivityModal() {
        crudModal.classList.add('hidden');
        modalBody.innerHTML = '';
        currentActivityId = null;
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeActivityModal);
    crudModal.addEventListener('click', (e) => {
        if (e.target === crudModal) {
            closeActivityModal();
        }
    });

    // Exponer la función de renderizado principal
    window.activitiesManagement = {
        renderActivitiesManagementPage
    };
});
