import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { ICartSummaryData } from 'src/app/core/models/cart.mode';
import { DeliveryAddressType, DeliveryType, IDeliveryDetails } from 'src/app/core/models/delivery-details.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';
import { SaveQuoteModalComponent } from 'src/app/shared/components/save-quote-modal/save-quote-modal.component';
import { ITab } from 'src/app/shared/components/tabs/tabs.component';

@Component({
  selector: 'app-delivery-details',
  templateUrl: './delivery-details.component.html',
  styleUrls: ['./delivery-details.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [AutoDestroyService],
})
export class DeliveryDetailsComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  DELIVERY_TYPE = DeliveryType;

  deliveryDetails: IDeliveryDetails;
  deliveryDetailsFormData: IDeliveryDetails;
  isNewAddressType = true;
  isInvalidFormData: boolean;
  isLoadedBtn: boolean = true;
  isLoadingSaveBtn: boolean;

  cartData: ICartSummaryData;
  form: FormGroup;
  boxLabel: any;

  deliveryAddressTabs: ITab[] = [
    {
      index: 0,
      title: 'Enter address',
    },
    {
      index: 1,
      title: 'Choose from save',
    },
  ];

  get buttonContinueConfig(): IButtonConfig {
    return {
      text: 'Continue to Artwork',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      isDisabled: !this.isAllDataCorrect,
    };
  }
  get buttonSaveConfig(): IButtonConfig {
    return {
      text: 'Save as a quote',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '100%',
      isDisabled: false,
    };
  }
  breadcrumbs: IBreadcrumbs[] = [
    {
      name: 'Cart',
      url: '../',
    },
    {
      name: 'Delivery',
    },
  ];

  constructor(
    private cartService: CartService,
    private destroy$: AutoDestroyService,
    private toast: HotToastService,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getDeliveryData();
  }

  getDeliveryData(): void {
    this.cartService
      .getDeliveryDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.deliveryDetails = data.deliveryDetails;
          this.cartData = {
            ...data.cartDetails,
            deliveryType: data.deliveryDetails.deliveryType
          };
          this.isNewAddressType = this.deliveryDetails.deliveryAddressType === DeliveryAddressType.NewAddress;
          this.boxLabel = this.deliveryDetails.boxLabel;
  
          this.initForm();
        }        
      });
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      poNumber: [this.deliveryDetails?.poNumber || '', Validators.required],
    });
  }

  onSelectDeliveryTab(tab: { index: number; title: string }) {
    this.isNewAddressType = tab.index === 0;
  }

  saveData(): void {
    if (!this.isAllDataCorrect) {
      return;
    }

    this.isLoadedBtn = false;

    const file = this.boxLabel?.url ? this.boxLabel.url : this.boxLabel;
    let deliveryRequest = {
      ...this.deliveryDetailsFormData,
      poNumber: this.form.value.poNumber,
      ...(file && {
        boxLabel: file,
      }),
    };

    if (this.deliveryDetails.deliveryType === DeliveryType.Delivery) {
      deliveryRequest = {
        ...deliveryRequest,
        deliveryAddressType: this.isNewAddressType
          ? DeliveryAddressType.NewAddress 
          : DeliveryAddressType.FromAddressBook,
      };
    }

    this.cartService.submitDeliveryDetails(deliveryRequest)
      .pipe(
        catchError((err) => {
          this.isLoadedBtn = true

          throw err;
        }),
        takeUntil(this.destroy$)
      ).subscribe(() => this.router.navigate(['./cart/artwork']));
  }

  saveAsQuote(): void {
    let dialogConfig = new MatDialogConfig();
    this.isLoadingSaveBtn = true;

    dialogConfig = {
      width: '100%',
      maxWidth: '503px',
    };

    this.dialog
      .open(SaveQuoteModalComponent, dialogConfig)
      .afterClosed()
      .subscribe((quoteReference: string | null) => {
        if (quoteReference == null || !this.cartData) {
          return;
        }

        this.cartService
          .saveAsQuote(quoteReference)
          .pipe(
            takeUntil(this.destroy$),
            catchError((err) => {
              this.isLoadingSaveBtn = false;
              throw err;
            })
          ).subscribe((data) => {
            this.showSuccessToast(data.message);
            this.isLoadingSaveBtn = false;
          });
        })
  }

  fillDeliveryDetailsForm(formData: {
    data: IDeliveryDetails;
    isValid: boolean;
  }): void {
    this.isInvalidFormData = !formData.isValid;
    this.deliveryDetailsFormData = formData.data;
    this.deliveryDetails = {
      ...this.deliveryDetails,
      ...this.deliveryDetailsFormData,
    };
  }

  loadFile(file: any): void {
    this.boxLabel = file;
  }

  deleteFile(): void {
    const mediaId = this.boxLabel?.id;

    if (mediaId) {
      this.cartService
        .deleteMedia(mediaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => (this.boxLabel = ''));
    } else {
      this.boxLabel = '';
    }
  }

  showSuccessToast(message: string = 'Success!'): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        textAlign: 'center',
        color: '#168952',
      },
    });
  }

  get isAllDataCorrect(): boolean {
    return !this.isInvalidFormData && this.form.valid;
  }
}
