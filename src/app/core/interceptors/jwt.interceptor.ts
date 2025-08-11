import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  return next(
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req
  );
};
