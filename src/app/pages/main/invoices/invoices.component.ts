import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { InvoiceStatus } from 'src/app/core/enums/status.enum';
import { IInvoiceItem } from 'src/app/core/models/invoices.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { transformSelectList } from 'src/app/shared/utils/transform-select-list';
import { BaseMainComponent } from '../base-main/base-main.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: [
    '../base-main/base-main.component.less',
    './invoices.component.less',
  ],
  providers: [AutoDestroyService],
})
export class InvoicesComponent extends BaseMainComponent<IInvoiceItem> {
  displayedColumns: string[] = [
    // 'select',
    'id',
    'poNumber',
    'fullName',
    'createdAt',
    'dueDate',
    'total',
    'status',
  ];
  override filterConfig = {
    isLoaded: false,
    isFilterStatus: true,
    statuses: transformSelectList(InvoiceStatus),
    isFilterDate: true,
    isFilterPrise: true,
  };

  // TODO: future functionality
  // buttonConfig: IButtonConfig = {
  //   text: 'Pay with the card',
  //   viewType: ButtonViewType.Filled,
  //   padding: '0 42px',
  // };
  // totalAmountToPay: number = 0;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    platformDetectorService: PlatformDetectorService,
    private invoiceService: InvoiceService
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.invoiceService
      .getInvoices(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }

  override getFilter(): void {
    this.invoiceService
      .getInvoicesFilter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setFilter(data);
      });
  }

  // TODO: future functionality

  // override toggleAllRows(): void {
  //   super.toggleAllRows();

  //   if (!this.selection.selected.length) {
  //     this.totalAmountToPay = 0;
  //   }

  //   this.selection.selected.forEach((id) => this.calcTotalAmountToPay(id));
  // }

  // onToggleCheckbox(id: string): void {
  //   this.selection.toggle(id);
  //   this.calcTotalAmountToPay(id);
  // }

  // calcTotalAmountToPay(id: string): void {
  //   const isItemSelected = this.selection.isSelected(id);
  //   const invoice = this.dataSource.data.find(
  //     (d) => d.id === id && d.status === InvoiceStatus.NotPaid
  //   );
  //   const amount = +(invoice?.total || 0);

  //   isItemSelected
  //     ? (this.totalAmountToPay += amount)
  //     : (this.totalAmountToPay -= amount);
  // }

  // onPay(): void {}
}
