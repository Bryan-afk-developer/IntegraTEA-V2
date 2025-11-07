import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token de localStorage
  const token = localStorage.getItem('jwtToken');

  if (token) {
    // Si el token existe, clonamos la petición y le añadimos
    // el encabezado de Autorización.
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Pasamos la petición clonada (con el token) a la API
    return next(cloned);
  }

  // Si no hay token, simplemente dejamos pasar la petición original
  // (esto es útil para el Login)
  return next(req);
};