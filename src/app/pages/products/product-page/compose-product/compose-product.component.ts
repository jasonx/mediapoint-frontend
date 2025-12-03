import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, delay, forkJoin, of, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  IComposeProductStep,
  ISummary,
  IWidgetPostData,
} from 'src/app/core/models/compose-product.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CreateOrderService } from 'src/app/core/services/create-order.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MyProductsService } from 'src/app/core/services/my-products.service';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { isValue } from 'src/app/shared/utils/remove-empty';

@Component({
  selector: 'app-compose-product',
  templateUrl: './compose-product.component.html',
  styleUrls: ['./compose-product.component.less'],
  providers: [AutoDestroyService],
})
export class ComposeProductComponent implements OnInit, OnDestroy {
  @Input() productId: number;
  @Input() jobId: string | null;
  @Input() myProductId: string;
  @Input() isEditMode: boolean;

  WidgetsKey = WidgetsKey;
  widgets: IComposeProductStep[] = [];
  summary: ISummary;
  indexExpanded: number;
  isLoadedSaveBtn = true;
  isLoadedAddToCartBtn = true;

  get buttonCartConfig(): IButtonConfig {
    return {
      text: 'Add to Cart',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      isDisabled: !this.dataValidToSave,
    };
  }

  get buttonSaveConfig(): IButtonConfig {
    return {
      text: 'Save parameters',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '100%',
      isDisabled:
        this.widgets.length <= 1 || !this.orderService.jobIdUnsavedParams,
    };
  }

  get buttonResetConfig(): IButtonConfig {
    return {
      text: 'Reset parameters',
      viewType: ButtonViewType.Text,
      color: '#FF5858',
      minWidth: '100%',
      padding: '10.5px',
      isDisabled: this.widgets.length <= 1,
    };
  }

  buttonLoginConfig: IButtonConfig = {
    text: 'Login for Pricing',
    viewType: ButtonViewType.Filled,
    minWidth: '100%',
  };
  buttonRegisterConfig: IButtonConfig = {
    text: 'Register for Pricing',
    viewType: ButtonViewType.TransparentBlue,
    minWidth: '100%',
  };

  get dataValidToSave(): boolean {
    return this.orderService.isCanAddToCart && !this.orderService.isGlobalError;
  }

  @ViewChildren('widgetsTitle') lastWidget: QueryList<ElementRef>;

  constructor(
    private orderService: CreateOrderService,
    private myProductsService: MyProductsService,
    private toast: HotToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private headerService: HeaderService,
    private authService: AuthorizationService,
    private destroy$: AutoDestroyService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    if (!this.myProductId) {
      this.getJobId();
    } else {
      this.getWidgetsMyProduct();
    }

    this.subscribeToSaveData();
  }

  getJobId(): void {
    this.jobId =
      this.jobId || this.activatedRoute.snapshot.queryParamMap.get('job_id');
    this.orderService.jobIdUnsavedParams = this.jobId;

    this.getWidgetsData();
  }

  getWidgetsData(isScroll?: boolean): void {
    this.orderService
      .getAllWidgets(this.productId, this.jobId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.setNewJobId(null);

          throw err;
        })
      )
      .subscribe((data) => {
        this.widgets = data.completedSteps.concat(data.currentStep);
        this.setSummary(data.summary);
        this.openLastWidget();

        if (isScroll) {
          this.onScroll();
        }
      });
  }

  getWidgetsMyProduct(): void {
    this.myProductsService
      .getMyProduct(this.myProductId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          throw err;
        })
      )
      .subscribe((data) => {
        this.jobId = data.jobId.toString();
        this.widgets = data.completedSteps.concat(data.currentStep);
        this.setSummary(data.summary);
        this.openLastWidget();
      });
  }

  setSummary(summary: ISummary | null): void {
    this.orderService.summary.next(summary);
  }

  subscribeToSaveData(): void {
    this.orderService.widgetDataToSave
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!isValue(data)) {
          this.openLastWidget();

          return;
        }

        if (this.isLoggedIn) {
          this.saveData(data);
        } else {
          this.showDialogForLogin();
        }
      });

    this.orderService.summary
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.summary = data as ISummary));
  }

  saveData(properties: IWidgetPostData): void {
    this.orderService.isLoadedWidget.next(false);
    this.orderService
      .postWidgetData(this.productId, this.jobId, properties)
      .pipe(
        catchError((err) => {
          this.orderService.setGlobalError(
            properties.stepKey,
            err.error.message
          );
          this.orderService.isLoadedWidget.next(true);

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        if (!this.jobId) {
          this.setNewJobId(data.jobId.toString());
          this.saveData(properties);
        } else {
          this.widgets = data.completedSteps.concat(data.currentStep);
          this.setSummary(data.summary);
          this.openLastWidget();
          this.orderService.resetGlobalError();
          this.orderService.isLoadedWidget.next(true);
          this.orderService.jobIdUnsavedParams = this.jobId;
          this.onScroll();
        }
      });
  }

  openLastWidget(): void {
    this.indexExpanded = this.widgets.length - 1;
  }

  setNewJobId(jobId: string | null): void {
    this.jobId = jobId;
    this.orderService.jobIdUnsavedParams = this.jobId;

    if (this.platformDetectorService.isBrowser()) {
      const windowTop = window.scrollY;

      this.router
        .navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: { job_id: jobId },
        })
        .then(() => {
          this.onScroll(windowTop);
        });
    }
  }

  addToCart(): void {
    if (!this.jobId) {
      return;
    }

    this.isLoadedAddToCartBtn = false;

    this.orderService
      .addToCart(this.jobId)
      .pipe(
        catchError((err) => {
          this.isLoadedAddToCartBtn = true;

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isLoadedAddToCartBtn = true;
        this.orderService.jobIdUnsavedParams = null;

        let dialogConfig = new MatDialogConfig();

        dialogConfig = {
          ...dialogConfig,
          width: '100%',
          maxWidth: '600px',
          data: {
            title: 'Added Successfully!',
            message: 'Keep exploring our product range to add more items to your order, or move to your cart to upload artwork and finalise your order.',
            informationButtonText: 'Continue to Cart',
            declineButtonText: 'Add Another Product',
          },
        };

        this.dialog
          .open(DialogComponent, dialogConfig)
          .afterClosed()
          .pipe(takeUntil(this.destroy$))
          .subscribe((event: DialogActionEnum) => {
            if (event === DialogActionEnum.Close) {
              this.router.navigate(['/cart']).then();
            } else {
              this.router.navigate(['/catalog']).then();
            }
          });
      });
  }

  saveParameters(): void {
    if (!this.jobId) {
      return;
    }

    this.isLoadedSaveBtn = false;

    this.orderService
      .saveParams(this.jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showSuccessToast('Parameters saved successfully!');
        this.isLoadedSaveBtn = true;
      });
  }

  resetParameters(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '558px',
      data: {
        title: 'Reset parameters',
        message: 'Are you sure you want to reset the parameters?',
        acceptButtonText: 'Reset',
        declineButtonText: 'Cancel',
      },
    };

    this.dialog
      .open(DialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DialogActionEnum) => {
        if (event === DialogActionEnum.Accept && this.jobId) {
          forkJoin({
            reset: this.orderService.deleteJob(this.jobId),
            getNewData: this.orderService.getAllWidgets(this.productId),
          })
            .pipe(
              catchError((err) => {
                throw err;
              }),
              takeUntil(this.destroy$)
            )
            .subscribe((data) => {
              this.widgets = [data.getNewData.currentStep];
              this.setSummary(data.getNewData.summary);
              this.clearOrderData();
              this.setNewJobId(null);

              this.onScroll();
              this.showSuccessToast('Parameters reset successfully!');
            });
        }
      });
  }

  clearOrderData(): void {
    this.orderService.widgetDataToSave.next({} as IWidgetPostData);
    this.orderService.isCanAddToCart = false;
  }

  showSuccessToast(message: string = 'Success!'): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        color: '#168952',
      },
    });
  }

  onScroll(windowTop?: number): void {
    if (this.platformDetectorService.isBrowser()) {
      if (windowTop) {
        window.scroll({
          top: windowTop,
          left: 0,
        });
      }
  
      of(null)
        .pipe(delay(100))
        .subscribe(() => {
          const top =
            window.scrollY +
            this.lastWidget.last.nativeElement.getBoundingClientRect().top -
            this.headerService.headerHeight$.value -
            40;
  
          window.scroll({
            top,
            left: 0,
            behavior: 'smooth',
          });
        });
    }
  }

  showDialogForLogin(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '400px',
      panelClass: 'need-auth',
      data: {
        title: 'Need Authorisation',
        message: 'To proceed, please log in <br /> or register for access to pricing and ordering.',
        isBtnRed: true,
        informationButtonText: 'Login for Pricing',
        acceptButtonText: 'Register for Pricing',
      },
    };

    this.dialog
      .open(DialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DialogActionEnum) => {
        if (event === DialogActionEnum.Close) {
          this.goToLogin();
        }

        if (event === DialogActionEnum.Accept) {
          this.goToLogin(true);
        }
      });
  }

  goToLogin(isRegisterPage?: boolean): void {
    this.authService.fromPageUrl = this.router.url;
    this.router
      .navigate([
        './authorization/' + (isRegisterPage ? 'registration' : 'login'),
      ])
      .then();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  ngOnDestroy(): void {
    this.clearOrderData();
  }
}
