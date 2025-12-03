import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IListData } from 'src/app/core/models/base.model';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  IArtworkDetails,
  ICartSummaryData,
} from 'src/app/core/models/cart.mode';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';
import { SaveQuoteModalComponent } from 'src/app/shared/components/save-quote-modal/save-quote-modal.component';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';
import { ICredit } from 'src/app/core/models/confirm-and-payment.model';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { JobStatus } from 'src/app/core/enums/status.enum';

@Component({
  selector: 'app-artwork-page',
  templateUrl: './artwork-page.component.html',
  styleUrls: ['./artwork-page.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkPageComponent implements OnInit {
  pageType: 'artwork' | 'checkout' = 'artwork';
  artworksData: IArtworkDetails[];
  cartData: ICartSummaryData;
  deliveryDetails: IListData[];
  isLoadingSaveBtn: boolean;
  isAllQuantityApplied: boolean;
  creditData: ICredit = {
    hasEnoughCredits: false,
    isCreditEnabled: false,
  };

  toKebabCase = toKebabCase;

  get buttonContinueConfig(): IButtonConfig {
    return {
      text: this.isUseCredit
        ? 'Continue to Final Review'
        : 'Continue to Final Review & Payment',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      tooltip: !this.isAllQuantityApplied
        ? 'Check the quantity of the jobs'
        : '',
      isDisabled: !this.isAllValid,
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
  buttonEditArtworkConfig: IButtonConfig = {
    text: 'Edit',
    viewType: ButtonViewType.LightBlue,
    minWidth: '100%',
    icon: 'edit.svg',
    customClass: 'small border-radius',
  };
  buttonUploadArtworkConfig: IButtonConfig = {
    text: 'Upload',
    viewType: ButtonViewType.LightBlue,
    minWidth: '100%',
    icon: 'download.svg',
    customClass: 'small border-radius',
  };

  breadcrumbs: IBreadcrumbs[] = [
    {
      name: 'Cart',
      url: '../',
    },
    {
      name: 'Delivery',
      url: '../delivery-details',
    },
  ];

  constructor(
    private dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private router: Router,
    private cartService: CartService,
    private toast: HotToastService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.pageType = this.activatedRoute.snapshot.data['page'];
    this.breadcrumbs = [
      ...this.breadcrumbs,
      {
        name: this.isArtworkPage ? 'Artwork' : 'Checkout',
      },
    ];
    this.getArtworkData();
    this.subscribeToUpdates();
  }

  getArtworkData(): void {
    this.cartService
      .getArtworks()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.artworksData = data.artworkDetails;
          this.cartData = data.cartDetails;
          this.deliveryDetails = data.deliveryDetails;
          this.creditData = data.useCredit;
          this.isAllQuantityApplied = data.allQuantityApplied;
        }
      });
  }

  subscribeToUpdates(): void {
    this.cartService.updatedArtwork$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedArtwork) => {
        if (updatedArtwork) {
          this.getArtworkData();
        }
      });
  }

  editArtwork(jobId: number): void {
    this.router.navigate(['/cart/artwork-details/' + jobId]);
  }

  uploadArtwork(jobId: number): void {
    this.router.navigate(['/cart/artwork-details/' + jobId]);
  }

  openAcceptModal(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '980px',
      data: {
        isUseCredit: this.isUseCredit,
      },
    };

    this.dialog.open(PaymentDialogComponent, dialogConfig);
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
          )
          .subscribe((data) => {
            this.showSuccessToast(data.message);
            this.isLoadingSaveBtn = false;
          });
      });
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

  get isArtworkPage(): boolean {
    return this.pageType === 'artwork';
  }

  get isUseCredit(): boolean {
    return (
      (this.creditData.isCreditEnabled && this.creditData.hasEnoughCredits) ||
      this.cartData.priceDetails.total === 0
    );
  }

  get isAllValid(): boolean {
    return (
      this.artworksData.every(
        (a) => a.status === JobStatus.proofAwaitingApproval
      ) && this.isAllQuantityApplied
    );
  }
}
