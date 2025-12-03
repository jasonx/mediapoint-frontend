import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ICompanyOrderItem } from 'src/app/core/models/customers.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CustomersService } from 'src/app/core/services/customers.service';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { BaseMainComponent } from '../../../base-main/base-main.component';
import { IOrderItem } from '../../../../../core/models/orders.model';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-company-orders',
  templateUrl: './company-orders.component.html',
  styleUrls: ['./company-orders.component.less'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  providers: [AutoDestroyService],
})
export class CompanyOrdersComponent extends BaseMainComponent<ICompanyOrderItem> {
  displayedColumns: string[] = [
    'id',
    'accepted',
    'totalPrice',
    'customer',
    'status',
    'expand',
  ];
  expandedElements: any[] = [];

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    platformDetectorService: PlatformDetectorService,
    private customersService: CustomersService
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.customersService
      .getCompanyOrders(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }

  setExpandedElement(event: Event, element: IOrderItem): void {
    const isClickOnBtn = (event.target as HTMLElement).className.includes(
      'btn'
    );

    if (isClickOnBtn) {
      return;
    }

    const index = this.expandedElements.indexOf(element);

    if (index === -1) {
      this.expandedElements.push(element);
    } else {
      this.expandedElements.splice(index, 1);
    }

    event.stopPropagation();
  }

  isExpanded(el: any): boolean {
    return this.expandedElements.includes(el);
  }
}
