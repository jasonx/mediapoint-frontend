import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';
import { PlatformDetectorService } from '../services/platform-detector.service';

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedUserGuard implements CanActivate {
  constructor(
    private authService: AuthorizationService,
    private router: Router,
    private platformDetectorService: PlatformDetectorService
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isLoggedIn) {
      return this.platformDetectorService.isBrowser() ? this.router.navigate(['/authorization/login']) : false;
    }

    return true;
  }
}
