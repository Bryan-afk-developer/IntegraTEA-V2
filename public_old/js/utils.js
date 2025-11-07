// public/js/utils.js
// Define la URL base de tu API (debe coincidir con el puerto de tu servidor Express)
// Si el frontend se sirve desde el mismo Express, puedes usar window.location.origin
// Si se sirve desde otro lado, usa "http://localhost:5000" (o el puerto de tu Express)
const API_BASE_URL = window.location.origin;

// Función para obtener el token JWT del localStorage
function getToken() {
    return localStorage.getItem('jwtToken');
}

// Función para obtener los headers de autenticación para las peticiones a la API
function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Exportar estas funciones globalmente para que otros scripts puedan usarlas
window.appUtils = {
    API_BASE_URL,
    getToken,
    getAuthHeaders
};