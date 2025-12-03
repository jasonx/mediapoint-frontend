import { Component, ViewEncapsulation } from '@angular/core';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';

@Component({
  selector: 'app-authorization-base',
  templateUrl: './authorization-base.component.html',
  styleUrls: ['./authorization-base.component.less'],
  providers: [AutoDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class AuthorizationBaseComponent {}
