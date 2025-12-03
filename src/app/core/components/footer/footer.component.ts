import { Component } from '@angular/core';
import { AuthorizationService } from '../../services/authorization.service';
import { IGeneralInfo } from '../../models/general.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.less'],
})
export class FooterComponent {
  constructor(private authService: AuthorizationService) {}

  get generalInfo(): IGeneralInfo {
    return this.authService.generalInfo$.value;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
