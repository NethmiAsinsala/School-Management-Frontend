import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();

  // Don't attach a token to the login request itself
  if (!token || req.url.includes('/auth/tokens')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.invalidateSession();
      }
      return throwError(() => error);
    })
  );
};
