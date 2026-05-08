import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = localStorage.getItem('accessToken');

    // ✅ Attach token
    let authReq = req;
    if (accessToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(authReq).pipe(

      catchError((error: HttpErrorResponse) => {

        // 🔴 If token expired → try refresh
        if (error.status === 401) {

          return this.authService.refreshToken().pipe(

            switchMap((res: any) => {

              // ✅ Save new tokens
              localStorage.setItem('accessToken', res.data.accessToken);
              localStorage.setItem('refreshToken', res.data.refreshToken);

              // 🔁 Retry original request
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.data.accessToken}`
                }
              });

              return next.handle(retryReq);
            }),

            catchError(err => {
              localStorage.clear();

              // 🔥 Redirect to login
              window.location.href = '/login';

              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
