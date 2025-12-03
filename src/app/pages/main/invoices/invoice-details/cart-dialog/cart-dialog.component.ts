import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, delay, of, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  CardFieldType,
  EWAY_ERRORS,
} from 'src/app/core/models/confirm-and-payment.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart-dialog',
  templateUrl: './cart-dialog.component.html',
  styleUrls: ['./cart-dialog.component.less'],
  providers: [AutoDestroyService],
})
export class CartDialogComponent implements OnInit {
  isPayLoaded: boolean = true;
  isCartLoaded: boolean;
  secureCode: string;
  generalError: string;
  fieldsError = {
    name: '',
    number: '',
    expiry: '',
    cvn: '',
  };

  fieldStyles =
    'padding: 12px 16px; border: 1px solid transparent; border-radius: 6px; height: 44px; width: 100%; box-shadow: none; font-family: Poppins, sans-serif; background: transparent;';
  labelStyles =
    'color: #111729; font-size: 12px; line-height: 18px; margin-bottom: 4px; font-weight: 400; font-family: Poppins, sans-serif;';

  groupFieldConfig = {
    publicApiKey: environment.ewayKey,
    fieldDivId: 'eway-secure-panel',
    fieldType: 'group',
    layout: {
      fonts: ['Poppins'],
      rows: [
        {
          cells: [
            {
              colSpan: 12,
              styles: 'margin-bottom: 16px',
              label: {
                fieldColSpan: 12,
                text: 'Name on Card',
                styles: this.labelStyles,
              },
              field: {
                fieldColSpan: 12,
                fieldType: 'name',
                styles: this.fieldStyles,
              },
            },
            {
              colSpan: 12,
              styles: 'margin-bottom: 16px',
              label: {
                fieldColSpan: 12,
                text: 'Card Number',
                styles: this.labelStyles,
              },
              field: {
                fieldColSpan: 12,
                fieldType: 'card',
                styles: this.fieldStyles,
              },
            },
          ],
        },
        {
          styles: 'display: flex;',
          cells: [
            {
              colSpan: 6,
              styles: 'margin-right: 16px',
              label: {
                fieldColSpan: 12,
                text: 'Expiry Date',
                styles: this.labelStyles,
              },
              field: {
                fieldColSpan: 12,
                fieldType: 'expirytext',
                styles: this.fieldStyles,
              },
            },
            {
              colSpan: 6,
              label: {
                fieldColSpan: 12,
                text: 'Security Code (CVN)',
                styles: this.labelStyles,
              },
              field: {
                fieldColSpan: 12,
                fieldType: 'cvn',
                styles: this.fieldStyles,
              },
            },
          ],
        },
      ],
    },
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isUseCredit?: boolean;
      cartId?: string;
    },
    public cartService: CartService,
    public dialogRef: MatDialogRef<CartDialogComponent>,
    public toast: HotToastService,
    public destroy$: AutoDestroyService
  ) {}

  get buttonConfig(): IButtonConfig {
    return {
      text: 'Pay now',
      viewType: ButtonViewType.Filled,
      padding: '0 30px',
      minWidth: '100%',
      isDisabled: this.isBtnDisabled,
    };
  }

  ngOnInit(): void {
    this.loadCart();
    this.setupSecureField();
  }

  loadCart(): void {
    of(null)
      .pipe(delay(2500))
      .subscribe(() => {
        this.isCartLoaded = true;
      });
  }

  setupSecureField(): void {
    secureField.prototype.saveField = function () {
      if (this.iframe.contentWindow && this.needsSave == true) {
        this.iframe.contentWindow.postMessage('save', '*');
      }
    };

    eWAY.setupSecureField(this.groupFieldConfig, (event: any) => {
      this.generalError = '';
      this.setFieldsErrors(event.errors);
      this.secureCode = event.secureFieldCode;
    });
  }

  setFieldsErrors(errors: string): void {
    errors = errors || '';
    this.fieldsError = {
      name: this.getErrorText(errors, CardFieldType.Name),
      number: this.getErrorText(errors, CardFieldType.Number),
      expiry: this.getErrorText(errors, CardFieldType.Expiry),
      cvn: this.getErrorText(errors, CardFieldType.Cvn),
    };
  }

  getErrorText(errors: string, type: CardFieldType): string {
    const errorObj = EWAY_ERRORS.find((e) => e.type === type);
    const keys = errorObj?.keys || '';
    const isError = keys.split(' ').find((e) => errors.split(' ').includes(e));

    return isError ? errorObj?.text || '' : '';
  }

  onPay(): void {
    this.isPayLoaded = false;

    eWAY.saveAllFields(() => {
      this.cartService
        .paymentComplete(this.secureCode, this.data.cartId)
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
            this.generalError = data.message;
            this.setFieldsErrorsFromBack(data.errors);
          } else {
            this.dialogRef.close('success');
          }

          this.isPayLoaded = true;
        });
    }, 2000);
  }

  setFieldsErrorsFromBack(errors: string[]) {
    this.fieldsError = {
      name: this.isErrorFromBack(errors, CardFieldType.Name)
        ? 'Invalid card name'
        : '',
      number: this.isErrorFromBack(errors, CardFieldType.Number)
        ? 'Invalid card number'
        : '',
      expiry: this.isErrorFromBack(errors, CardFieldType.Expiry)
        ? 'Invalid expiry date'
        : '',
      cvn: this.isErrorFromBack(errors, CardFieldType.Cvn) ? 'Invalid cvn' : '',
    };
  }

  isErrorFromBack(errors: string[], type: CardFieldType): boolean {
    return !!errors.find((e) => e.includes(type));
  }

  showToast(message: string): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #ffecec',
        border: '1px solid #A83B3B',
        padding: '16px',
        color: '#A83B3B',
      },
    });
  }

  get isBtnDisabled(): boolean {
    return (
      !!this.generalError ||
      !this.secureCode ||
      !!Object.values(this.fieldsError).find((v) => v)
    );
  }
}
