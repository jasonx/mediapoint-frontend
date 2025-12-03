import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { InvoiceStatus } from 'src/app/core/enums/status.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IInvoiceDetails } from 'src/app/core/models/invoices.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CreateOrderService } from 'src/app/core/services/create-order.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';
import { CartDialogComponent } from './cart-dialog/cart-dialog.component';
import { DIALOG_ICON } from 'src/app/core/constants/dialog-icon.constant';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.less'],
  providers: [AutoDestroyService],
})
export class InvoiceDetailsComponent implements OnInit {
  toKebabCase = toKebabCase;
  invoiceId: string;
  invoiceData: IInvoiceDetails;
  file: File;

  breadcrumbs: IBreadcrumbs[] = [
    {
      name: 'Invoices',
      url: 'back',
    },
    {
      name: this.activatedRoute.snapshot.params?.['invoiceId'],
    },
  ];

  buttonPaymentConfig: IButtonConfig = {
    text: 'Payment',
    viewType: ButtonViewType.Filled,
    minWidth: '100%',
  };
  dialogThanksConfig: IDialogConfig = {
    icon: DIALOG_ICON.EMAIL,
    title: 'Thanks for your order',
    message:
      'Your order is being processed with care. If you have any questions, feel free to contact us.',
    informationButtonText: 'Go home',
  };

  constructor(
    private createOrderService: CreateOrderService,
    private dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private router: Router,
    private invoiceService: InvoiceService,
    private authorizationService: AuthorizationService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.invoiceId = this.activatedRoute.snapshot.params?.['invoiceId'];

    this.getInvoice();
    this.getInvoicePdf();
  }

  getInvoice(): void {
    this.invoiceService.getInvoice(this.invoiceId).subscribe((data) => {
      this.invoiceData = data;
      this.createOrderService.cartId.next(this.invoiceData.cartId);
    });
  }

  getInvoicePdf(): void {
    this.invoiceService
      .getOrderPdf(this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.file = new File([data], `Invoice-${this.invoiceId}.pdf`);
      });
  }

  onPayment(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '620px',
      maxHeight: '90vh',
      data: {
        cartId: this.invoiceData.cartId,
      },
    };

    const dialogRef = this.dialog.open(CartDialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action) {
          this.openThanksModal();
        }
      });
  }

  openThanksModal(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogThanksConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.router.navigate(['./']).then());
  }

  get isShowPayBtn(): boolean {
    return (
      this.invoiceData.status === InvoiceStatus.NotPaid &&
      !this.authorizationService.isAdmin
    );
  }
}
