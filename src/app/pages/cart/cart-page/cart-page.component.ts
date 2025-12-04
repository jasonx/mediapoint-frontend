import { Component, OnInit } from '@angular/core';
import { CartDeliverySteps, ICartData, ICartDeliveryData, IDeliveryMethod, IPackagingInformation, IShippingLocations } from '../../../core/models/cart.mode';
import { IButtonConfig } from '../../../core/models/button-config.model';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { CartService } from '../../../core/services/cart.service';
import { CreateOrderService } from '../../../core/services/create-order.service';
import { HotToastService } from '@ngneat/hot-toast';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { catchError, debounceTime, delay, distinctUntilChanged, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { EditJobModalComponent } from '../../products/product-page/compose-product/edit-job-modal/edit-job-modal.component';
import { DialogActionEnum } from '../../../core/enums/dialog-action.enum';
import { IDialogConfig } from '../../../core/models/dialog-config.model';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { ITab } from '../../../shared/components/tabs/tabs.component';
import { FieldTypes } from '../../../core/enums/field-type.enum';
import { SaveQuoteModalComponent } from '../../../shared/components/save-quote-modal/save-quote-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';
import { AddressType } from 'src/app/core/enums/address-type.enum';
import { DeliveryType } from 'src/app/core/models/delivery-details.model';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.less'],
  providers: [AutoDestroyService],
})
export class CartPageComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  DELIVERY_STEPS = CartDeliverySteps;
  ADDRESS_TYPE = AddressType;

  cartData: ICartData | null = null;
  isLoaded: boolean;
  isMethodLoading: boolean;
  isLoadingCreateBtn: boolean;
  isLoadingSaveBtn: boolean;

  deliveryData: ICartDeliveryData;

  shippingMethodTabs: ITab[] = [
    {
      index: 0,
      title: DeliveryType.Pickup,
      icon: 'pickup-icon.svg',
    },
    {
      index: 1,
      title: DeliveryType.Delivery,
      icon: 'delivery-icon.svg',
    },
  ];
  selectedShippingMethodTab: ITab | undefined;
  packageDetails: IPackagingInformation | null;
  selectedPackages: number[] = [];
  addressType: AddressType | undefined;
  listOfAddress: IShippingLocations[] = [];
  listOfAddressString: string[] = [];
  isNotFound: boolean;
  compiledAddress: string;
  deliveryMethods: IDeliveryMethod[] = [];
  selectedDeliveryMethod: IDeliveryMethod = {} as IDeliveryMethod;
  searchSubject = new Subject<string>();
  file: File | null = null;
  sortBy: 'fastest' | 'cheapest' = 'fastest';

  get buttonCreateConfig(): IButtonConfig {
    return {
      text: 'Continue',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      isDisabled: !this.isDeliveryDataValid,
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
  get buttonClearConfig(): IButtonConfig {
    return {
      text: 'Empty shopping cart',
      viewType: ButtonViewType.Text,
      color: '#FF5858',
      padding: '12px 5px',
      minWidth: '100%',
      isDisabled: !this.cartData,
    };
  }
  buttonEmptyConfig: IButtonConfig = {
    text: 'Add a job',
    viewType: ButtonViewType.LightBlue,
    minWidth: '244px',
  };

  constructor(
    private cartService: CartService,
    private orderService: CreateOrderService,
    private toast: HotToastService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private destroy$: AutoDestroyService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.getCartData();
    this.getDeliveryMethods();
    this.subscribeToSearch();
  }

  getCartData(): void {
    this.cartService
      .getCartData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cartData) => {
        this.cartData = cartData.cartId ? cartData : null;

        this.checkRedirect(cartData.checkoutHistory ? cartData.checkoutHistory.currentStep : '');
        this.initDeliveryData();

        this.isLoaded = true;
      });
  }

  checkRedirect(currentStep: string): void {
    const redirect = this.activatedRoute.snapshot.queryParamMap.get('redirect');

    if (redirect) {
      let stepUrl = '';

      switch (currentStep) {
        case 'delivery':
          stepUrl = 'delivery-details';
          break;
        case 'artworks':
          stepUrl = 'artwork';
          break;
        case 'checkout':
          stepUrl = 'checkout';
          break;
      }

      this.router.navigate(['/cart/' + stepUrl]);
    }
  }

  getDeliveryMethods(): void {
    this.isMethodLoading = true;
    this.deliveryMethods = [];

    this.cartService
      .getDeliveryMethods()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isMethodLoading = false;

          return throwError(() => new Error(err));
        })
      )
      .subscribe((data) => {
        this.deliveryMethods = this.sortDeliveryMethods(data);
        this.isMethodLoading = false;

        const selectedMethod = data.find((d) => d.carrierServiceId === this.cartData?.shippingMethodId);

        if (selectedMethod) {
          this.selectedDeliveryMethod = selectedMethod;
        }

        if (this.isDeliveryDataValid) {
          this.getCartPdf();
        }
      });
  }

  onSortChange(sortType: 'fastest' | 'cheapest'): void {
    if (this.sortBy === sortType) {
      return;
    }
    this.sortBy = sortType;
    this.deliveryMethods = this.sortDeliveryMethods(this.deliveryMethods);
  }

  sortDeliveryMethods(methods: IDeliveryMethod[]): IDeliveryMethod[] {
    return [...methods].sort((a, b) => {
      if (this.sortBy === 'fastest') {
        // Sort by delivery days first, then by price
        if (a.totalDays !== b.totalDays) {
          return a.totalDays - b.totalDays;
        }
        return a.priceDisplay - b.priceDisplay;
      } else {
        // Sort by price first, then by delivery days
        if (a.priceDisplay !== b.priceDisplay) {
          return a.priceDisplay - b.priceDisplay;
        }
        return a.totalDays - b.totalDays;
      }
    });
  }

  initDeliveryData(): void {
    if (!this.cartData) {
      return;
    }

    const type = this.cartData.deliveryType;

    if (type) {
      const tab = this.shippingMethodTabs.find(s => s.title === type);

      this.selectedShippingMethodTab = tab || undefined;
    }

    this.packageDetails = this.cartData?.packagingInformation;
    this.setSelectedPackages();
    this.addressType = this.cartData?.addressDetails?.addressType;
    this.compiledAddress = this.cartData?.addressDetails?.compiledAddress;

    if (this.isDeliveryDataValid && !this.file) {
      this.getCartPdf();
    }
  }

  setSelectedPackages(): void {
    if (!this.packageDetails) {
      return;
    }

    this.selectedPackages = [];

    this.packageDetails.availablePackages.forEach(p => {
      const selected = p.selectablePackages.find(s => s.isSelected);

      if(selected) {
        this.selectedPackages.push(selected.id);
      }
    });
  }

  onEditJob(jobId: string): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '834px',
      maxHeight: '90vh',
      data: {
        title: 'Edit the job #' + jobId,
        jobId,
      },
    };

    this.dialog
      .open(EditJobModalComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getCartData();
      });
  }

  onDeleteJob(jobId: string): void {
    const dialogData = {
      title: 'Are you sure?',
      message: 'Do you want to delete this job?',
      acceptButtonText: 'Delete',
      declineButtonText: 'Cancel',
    };
    const callbackFn = (event: DialogActionEnum) => {
      if (event === DialogActionEnum.Accept) {
        this.orderService
          .deleteJob(jobId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.showSuccessToast(data.message);
            this.getCartData();
          });
      }
    };

    this.openDialog(dialogData, callbackFn);
  }

  createQuote(): void {
    if (!this.isDeliveryDataValid) {
      return;
    }

    this.isLoadingCreateBtn = true;
    this.cartService.createQuote()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadingCreateBtn = false;
          return throwError(() => err);
        })
      ).subscribe(() => {
        this.router.navigate(['./cart/delivery-details']);
      });
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
          this.isLoadingSaveBtn = false;

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

  clearCart(): void {
    const dialogData = {
      title: 'Are you sure?',
      message: 'Do you want to empty your cart?',
      acceptButtonText: 'Yes, empty cart',
      declineButtonText: 'No, continue ordering',
    };
    const callbackFn = (event: DialogActionEnum) => {
      if (event === DialogActionEnum.Accept && this.cartData) {
        this.cartService
          .deleteCart(this.cartData.cartId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.showSuccessToast(data.message);
            this.cartData = null;
            this.scrollToTop();
          });
      }
    };

    this.openDialog(dialogData, callbackFn);
  }

  openDialog(
    data: IDialogConfig,
    callbackFn: (event: DialogActionEnum) => void
  ): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '558px',
      data,
    };

    this.dialog
      .open(DialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DialogActionEnum) => callbackFn(event));
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

  onSelectShippingMethod(tab: ITab): void {
    if (tab.title === this.selectedShippingMethodTab?.title) {
      return;
    }

    this.selectedShippingMethodTab = tab;
    const type = tab.title as DeliveryType;

    this.cartService.saveDeliveryStep({ type })
      .pipe(takeUntil(this.destroy$))
      .subscribe((deliveryData) => {
        this.updateData(deliveryData);
      });
  }

  onSelectPackaging(id: string): void {
    this.selectedPackages.push(+id);

    this.cartService.saveDeliveryStep({ selectablePackageId: +id })
      .pipe(takeUntil(this.destroy$))
      .subscribe((deliveryData) => {
        this.updateData(deliveryData);
      });
  }

  onSelectAddress(type: AddressType): void {
    this.addressType = type;
    this.saveAddtess();
  }

  subscribeToSearch(): void {
    this.searchSubject
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) =>
        this.cartService.getShippingLocations(value).pipe(
          takeUntil(this.destroy$)
        )
      )
    ).subscribe((data) => {
      this.isNotFound = !data.length;
      this.listOfAddress = data;
      this.listOfAddressString = data.map((l) => l.suburbPostcode);
    });
  }

  searchAddress(value: string): void {
    if (value.length < 3 || this.compiledAddress === value) {
      of(null).pipe(delay(1000)).subscribe(() => this.listOfAddressString = []);

      return;
    }

    this.searchSubject.next(value);
  }
  
  onSelectSuburb(value: string): void {
    const selectedSuburb = this.listOfAddress.find(
      (l) => l.suburbPostcode === value
    );

    if (!selectedSuburb) {
      return;
    }

    this.compiledAddress = selectedSuburb.suburbPostcode;
    this.cartData ? this.cartData.addressDetails.suburb = this.compiledAddress : null
    this.saveAddtess();
  }

  saveAddtess(): void  {
    if (this.addressType && this.compiledAddress) {
      this.cartService.saveDeliveryStep({
        addressType: this.addressType,
        suburb: this.compiledAddress
      }).pipe(takeUntil(this.destroy$))
        .subscribe((deliveryData) => {
          this.updateData(deliveryData);
          this.getDeliveryMethods();
        });
    }
  }

  onSelectDeliveryMethod(shippingMethod: IDeliveryMethod): void {
    this.selectedDeliveryMethod = shippingMethod;

    this.cartService.saveDeliveryStep({ shippingMethod })
      .pipe(takeUntil(this.destroy$))
      .subscribe((deliveryData) => {
        this.updateData(deliveryData);
      });
  }

  updateData(deliveryData: ICartDeliveryData): void {
    this.deliveryData = deliveryData;
    this.packageDetails = deliveryData.packagingInformation;
    this.setSelectedPackages();
    
    if (this.cartData) {
      this.cartData = {
        ...this.cartData,
        ...this.deliveryData.summary,
        deliveryType: this.selectedShippingMethodTab?.title as DeliveryType,
        steps: {
          currentStep: this.deliveryData.currentStep,
          completedSteps: this.deliveryData.completedSteps
        }
      }
    }

    if (this.isDeliveryDataValid) {
      this.getCartPdf();
    } else {
      this.file = null;
    }
  }

  get isPackagingExist(): boolean {
    return !!(
      this.cartData?.steps.completedSteps.package
      || this.cartData?.steps.currentStep === this.DELIVERY_STEPS.Package
      && (this.packageDetails && this.packageDetails.availablePackages.length));
  }

  get isDeliveryDataValid(): boolean {
    if (this.isPickupType) {
      return !!this.selectedShippingMethodTab;
    } else {
      return !!(
        this.selectedShippingMethodTab &&
        this.addressType &&
        this.compiledAddress &&
        this.selectedDeliveryMethod.carrierServiceId
      );
    }
  }

  getCartPdf(): void {
    this.cartService
      .getCartPdf()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.file = new File([data], `Quote.pdf`);
      });
  }

  get isPickupType(): boolean {
    return this.selectedShippingMethodTab?.title === DeliveryType.Pickup;
  }

  selectedPackage(id: number): number | undefined {
    return this.selectedPackages.find(s => +s === +id);
  }

  scrollToTop(): void {
    if (this.platformDetectorService.isBrowser()) {
      window.scroll({
        top: 0,
        left: 0,
      });
    }
  }
}
