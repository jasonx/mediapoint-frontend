import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { Router } from '@angular/router';

export const credentialsDoNotMatch =
  'These credentials do not match our records.';
export const notConfirmedProfile =
  'Your profile is not confirmed by the administrator.';
export const companyDeleted =
  'The company you are associated with is no longer active in our system. Please email trade@mediapoint.com.au to get your account active again.';
export const notCompletedJobs = 'You have not completed jobs.';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: HotToastService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: (error) => {
          let errorMessage: string;

          if (error.error instanceof ErrorEvent) {
            errorMessage = `Client side error, Error: ${error.error.message}`;
          } else {
            errorMessage = `Server side error, Error Code: ${error.status},  Message: ${error.message}`;
          }

          console.log(errorMessage);

          if (error.status === 404) {
            this.router.navigate(['not-found']);
          } else if (this.showToast(error.status, error.error.message)) {
            this.toast.show('Something went wrong, try again later', {
              position: 'top-center',
              duration: 3000,
              style: {
                boxShadow: '0 3px 12px #ffecec',
                border: '1px solid #A83B3B',
                padding: '16px',
                color: '#A83B3B',
              },
            });
          }
        },
      })
    );
  }

  private showToast(status: number, message: string): boolean {
    const nonCriticalStatuses = [401, 422];
    const nonCriticalMessages = [
      notConfirmedProfile,
      companyDeleted,
      notCompletedJobs,
    ];
    const isCritical =
      nonCriticalStatuses.includes(status) ||
      nonCriticalMessages.includes(message);

    return !isCritical;
  }
}
