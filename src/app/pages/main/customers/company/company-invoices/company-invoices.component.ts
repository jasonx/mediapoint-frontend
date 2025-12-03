import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ICompanyInvoiceItem } from 'src/app/core/models/customers.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CustomersService } from 'src/app/core/services/customers.service';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { BaseMainComponent } from '../../../base-main/base-main.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-company-invoices',
  templateUrl: './company-invoices.component.html',
  styleUrls: ['./company-invoices.component.less'],
  providers: [AutoDestroyService],
})
export class CompanyInvoicesComponent extends BaseMainComponent<ICompanyInvoiceItem> {
  displayedColumns: string[] = [
    'id',
    'createdAt',
    'dueDate',
    'total',
    'status',
  ];

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
      .getCompanyInvoices(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }
}
