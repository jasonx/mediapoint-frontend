import { Component, Input } from '@angular/core';
import {
  BreadcrumbsType,
  IBreadcrumbs,
} from 'src/app/core/models/breadcrumbs.model';
import { NavigationHistoryService } from 'src/app/core/services/navigation-history.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.less'],
})
export class BreadcrumbsComponent {
  @Input() breadcrumbsData: IBreadcrumbs[] = [];

  constructor(private navigation: NavigationHistoryService) {}

  navigate(url?: BreadcrumbsType): void {
    if (url === 'back') {
      this.navigation.back();
    }
  }
}
