import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { API_URL } from './api-urls';
import { ApiService } from './api.service';
import { IForgotPassword } from '../models/forgot-password-form.model';
import { ILogin } from '../models/login-form.model';
import { IResetPassword } from '../models/reset-password-form.model';
import { Router } from '@angular/router';
import { LocalStorageKey } from '../enums/local-storage-key.enum';
import { IUserType } from '../models/user.model';
import { IGeneralCartIds, IGeneralInfo } from '../models/general.model';
import { ISettingsPersonalInformation } from '../models/personal-information.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);
  public userData$ = new BehaviorSubject<ISettingsPersonalInformation | null>(
    null
  );
  public generalInfo$ = new BehaviorSubject<IGeneralInfo>({} as IGeneralInfo);
  public fromPageUrl: null | string = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
    this.isLoggedIn$.next(!!this.token);
  }

  initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      this.getGeneralInfo();
  
      if (!this.isLoggedIn) {
        resolve();
        return;
      }
  
      this.getUserData();
  
      resolve();
    });
  }

  get isLoggedIn(): boolean {
    return this.isLoggedIn$.value;
  }

  get token(): string | null {
    return localStorage.getItem(LocalStorageKey.AccessToken);
  }

  get userId(): string | null {
    return localStorage.getItem(LocalStorageKey.UserId);
  }

  get rolesArr(): string[] {
    const roles = localStorage.getItem(LocalStorageKey.Roles);

    return Array(...JSON.parse(roles || '[]'));
  }

  get isAdmin(): boolean {
    return this.rolesArr.includes(IUserType.Admin);
  }

  get isEmployee(): boolean {
    return this.rolesArr.includes(IUserType.Employee);
  }

  get isOwner(): boolean {
    return this.rolesArr.includes(IUserType.Owner);
  }

  getGeneralInfo(successFn?: (data: IGeneralInfo) => void): void {
    this.apiService.get(API_URL.GENERAL).subscribe((data: IGeneralInfo) => {
      this.generalInfo$.next(data);

      if (successFn) {
        successFn(data);
      }
    });
  }

  getUserData(): void {
    if (!this.isLoggedIn) {
      return;
    }

    this.apiService.get(API_URL.SETTINGS_PERSONAL).subscribe((data) => {
      this.userData$.next(data);
    });
  }

  login(data: ILogin) {
    return this.apiService.post(API_URL.LOGIN, data).pipe(
      tap(
        (response: { accessToken: string; id: number; roles: IUserType[] }) => {
          localStorage.setItem(LocalStorageKey.AccessToken, response.accessToken);
          localStorage.setItem(LocalStorageKey.UserId, response.id + '');
          localStorage.setItem(
            LocalStorageKey.Roles,
            JSON.stringify(response.roles)
          );
          this.isLoggedIn$.next(true);
          this.getGeneralInfo();
          this.getUserData();
        }
      )
    );
  }

  logout(): void {
    if (!this.isLoggedIn) {
      return;
    }

    const action = (): void => {
      localStorage.clear();
      this.generalInfo$.next({
        ...this.generalInfo$.value,
        total: 0,
        user: {} as IGeneralCartIds
      });
      this.userData$.next(null);
      this.isLoggedIn$.next(false);
      this.goToLogout();
    };

    this.apiService
      .post(API_URL.LOGOUT)
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            action();
          }

          return throwError(() => {
            new Error(err);
          });
        })
      )
      .subscribe(() => action());
  }

  goToLogout(): void {
    this.router.navigate(['./authorization/login']).then();
  }

  forgotPassword(data: IForgotPassword) {
    return this.apiService.post(API_URL.FORGOT_PASSWORD, data);
  }

  resetPassword(data: IResetPassword, isChange?: boolean) {
    return isChange
      ? this.apiService.post(API_URL.CHANGE_PASSWORD, data)
      : this.apiService.post(API_URL.RESET_PASSWORD, data);
  }
}
