import { Component, ViewEncapsulation } from '@angular/core';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [AutoDestroyService],
})
export class SettingsComponent {
  routerItems: { title: string; icon: string }[] = [];
  isDeliveryPage: boolean;

  constructor(
    private authService: AuthorizationService,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isDeliveryPage = router.url.includes('delivery-settings');
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get isEmployee(): boolean {
    return this.authService.isEmployee;
  }
}
