import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, takeUntil } from 'rxjs';
import { DIALOG_ICON } from 'src/app/core/constants/dialog-icon.constant';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';
import { CartDialogComponent } from 'src/app/pages/main/invoices/invoice-details/cart-dialog/cart-dialog.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.less'],
  providers: [AutoDestroyService],
})
export class PaymentDialogComponent extends CartDialogComponent {
  isChecked1: boolean;
  isChecked2: boolean;
  orderId: number;

  FIELD_TYPES = FieldTypes;

  get acceptButtonConfig(): IButtonConfig {
    return {
      text: this.data.isUseCredit
        ? 'Send to Production'
        : 'Pay Now & Send to Production',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      padding: '0 16px',
      isDisabled: this.isBtnDisabled,
    };
  }
  get declineButtonConfig(): IButtonConfig {
    return {
      text: 'Cancel',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '100%',
      padding: '0 16px',
    };
  }
  dialogThanksConfig: IDialogConfig = {
    icon: DIALOG_ICON.EMAIL,
    title: 'Thanks for your order',
    message:
      'Your order is being processed with care. If you have any questions, feel free to contact us.',
    informationButtonText: 'Go home',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: {
      isUseCredit: boolean;
    },
    cartService: CartService,
    dialogRef: MatDialogRef<PaymentDialogComponent>,
    toast: HotToastService,
    destroy$: AutoDestroyService,
    private dialog: MatDialog,
    private authService: AuthorizationService,
    private router: Router
  ) {
    super(data, cartService, dialogRef, toast, destroy$);
  }

  onDecline(): void {
    this.dialogRef.close();
  }

  createOrder(): void {
    this.isPayLoaded = false;

    this.cartService
      .createOrder()
      .pipe(
        catchError((err) => {
          this.isPayLoaded = true;
          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.orderId = data.orderId;

        if (this.data.isUseCredit) {
          this.acceptAllProofs();
        } else {
          this.onPay();
        }
      });
  }

  override onPay(): void {
    eWAY.saveAllFields(() => {
      this.cartService
        .paymentComplete(this.secureCode)
        .pipe(
          catchError((err) => {
            this.isPayLoaded = true;

            if (err.error.message) {
              this.generalError = err.error.message;
            }

            throw err;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((data) => {
          if (data.errors.length) {
            this.isPayLoaded = true;
            this.generalError = data.message;
            this.setFieldsErrorsFromBack(data.errors);
          } else {
            this.acceptAllProofs();
          }
        });
    }, 2000);
  }

  acceptAllProofs(): void {
    this.cartService
      .acceptAllProofs(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dialogRef.close();
        this.openThanksModal();
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

    dialogRef.afterClosed().subscribe(() => {
      this.authService.getGeneralInfo();
      this.router.navigate(['./']).then();
    });
  }

  override get isBtnDisabled(): boolean {
    if (this.data.isUseCredit) {
      return !(this.isChecked1 && this.isChecked2);
    } else {
      return super.isBtnDisabled || !(this.isChecked1 && this.isChecked2);
    }
  }
}
