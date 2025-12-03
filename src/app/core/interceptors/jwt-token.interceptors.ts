import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class JtwTokenInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthorizationService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { token } = this.authService;

    return next
      .handle(
        token
          ? req.clone({
              headers: new HttpHeaders({
                Authorization: 'Bearer ' + token,
              }),
            })
          : req
      )
      .pipe(
        tap({
          error: (err) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status == 401) this.authService.logout();
            }
          },
        })
      );
  }
}
