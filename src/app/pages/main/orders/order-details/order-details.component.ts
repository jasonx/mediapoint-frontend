import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import {
  IStatusGroup,
  OrderStatus,
  orderStatusArray,
  Status,
} from 'src/app/core/enums/status.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { IOrderDetails } from 'src/app/core/models/orders.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { EventService } from 'src/app/core/services/event.service';
import { OrderService } from 'src/app/core/services/order.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';
import { ConfirmChangesComponent } from '../confirm-changes/confirm-changes.component';
import { toCamelObj } from 'src/app/shared/utils/camel';
import { isEmptyObj } from 'src/app/shared/utils/remove-empty';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { DateFormatted } from 'src/app/shared/utils/date';
import { DatePipe } from '@angular/common';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.less'],
  providers: [AutoDestroyService],
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  toKebabCase = toKebabCase;
  FIELD_TYPES = FieldTypes;
  orderStatusArray: IStatusGroup[] = orderStatusArray;
  orderData: IOrderDetails;
  file: File;
  form: FormGroup;
  orderId: string;
  isSaveBtnLoaded: boolean = true;
  isDeliveryType: boolean;
  isFilesLoaded: boolean;
  cancelButtonConfig: IButtonConfig = {
    text: 'Cancel order',
    viewType: ButtonViewType.LightBlue,
    minWidth: '100%',
  };
  saveTrackingNumberBtnConfig: IButtonConfig = {
    text: 'Save',
    viewType: ButtonViewType.LightBlue,
    minWidth: '186px',
  };
  breadcrumbs: IBreadcrumbs[] = [
    {
      name: 'Orders',
      url: 'back',
    },
    {
      name: this.activatedRoute.snapshot.params?.['orderId'],
    },
  ];
  get confirmButtonConfig(): IButtonConfig {
    return {
      text: 'Confirm changes',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      isDisabled: !this.orderService.isConfirmBtnActive,
    };
  }
  dialogCancelConfig: IDialogConfig = {
    title: 'Cancel order?',
    message: 'Are you sure you want to cancel this order?',
    declineButtonText: 'Close',
    informationButtonText: 'Cancel',
  };

  constructor(
    private dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private router: Router,
    private orderService: OrderService,
    private authorizationService: AuthorizationService,
    private eventService: EventService,
    private activatedRoute: ActivatedRoute,
    private toast: HotToastService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.orderId = this.activatedRoute.snapshot.params?.['orderId'];

        this.eventService.event$
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.updateOrderData();
          });

        this.firstInit();
      });
  }

  firstInit(): void {
    this.getOrderData();
    this.getOrderPdf();
    this.connectPusher();
  }

  getOrderData(): void {
    this.orderService
      .getOrder(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.orderData = data;
        this.orderData.priceDetails.numberOfJobs = data.jobs.length;

        this.setStatusesData();
        this.initForm();
        this.setDeliveryType();
        this.updateStatusList();
        this.cdr.detectChanges();
      });
  }

  initForm(): void {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      deliveryTracking: this.orderData.orderDetails.deliveryTracking || '',
    });
  }

  setDeliveryType(): void {
    this.isDeliveryType =
      this.orderData.freightDetails.find((f) => f.title === 'Type of delivery')
        ?.value === 'Delivery';
  }

  updateStatusList(): void {
    this.orderStatusArray = this.orderStatusArray.filter(
      (o) =>
        o.status !==
        (this.isDeliveryType
          ? OrderStatus.readyForPickup
          : OrderStatus.dispatched)
    );
  }

  updateOrderData(): void {
    this.orderService
      .getOrder(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.orderData = data;

        if (
          this.orderData.status === OrderStatus.production ||
          !this.orderData.jobs.length
        ) {
          this.backToPreviousPage();
        }

        this.setStatusesData();
        this.cdr.detectChanges();
      });
  }

  connectPusher(): void {
    this.orderService.connectPusher(this.orderId);
    this.orderService.orderDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((orderDetails) => {
        if (!orderDetails || isEmptyObj(orderDetails)) {
          return;
        }

        this.orderData = toCamelObj({
          ...this.orderData,
          jobs: orderDetails.jobs,
          status: orderDetails.status,
        });
      });
  }

  setStatusesData(): void {
    if (!this.isAdmin) {
      return;
    }

    this.orderService.statusChangesData = {
      order: {
        id: this.orderId,
        oldStatus: this.orderData.status,
      },
    };
  }

  duplicateJob(jobId: string): void {
    this.orderService.copyJob(jobId).subscribe(() => {
      this.router.navigate(['./quotes']).then();
    });
  }

  deleteJob(jobId: string): void {
    this.orderService.deleteJob(jobId).subscribe(() => this.getOrderData());
  }

  getOrderPdf(): void {
    this.orderService
      .getOrderPdf(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.file = new File([data], `Order-${this.orderId}.pdf`);
      });
  }

  changeOrderStatus(status: Status): void {
    const orderData = this.orderService.statusChangesData.order;
    const isOldStatus = orderData?.oldStatus === status;

    if (orderData) {
      orderData.newStatus = (isOldStatus ? '' : status) as OrderStatus;
    }
  }

  openCancelModal(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogCancelConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DialogActionEnum) => {
        if (event === DialogActionEnum.Close) {
          this.cancelOrder();
        }
      });
  }

  cancelOrder(): void {
    this.orderService
      .cancelOrder(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.backToPreviousPage());
  }

  saveTrackingNumber(): void {
    this.isSaveBtnLoaded = false;
    const deliveryTracking = this.form.get('deliveryTracking')?.value;

    this.orderService
      .saveTrackingNumber(this.orderId, deliveryTracking)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isSaveBtnLoaded = true;
          this.form.reset('');

          throw err;
        })
      )
      .subscribe(() => {
        this.isSaveBtnLoaded = true;

        this.toast.show('Tracking number saved', {
          position: 'top-center',
          duration: 3000,
          style: {
            boxShadow: '0 3px 12px #19623f36',
            border: '1px solid #168952',
            padding: '16px 50px',
            color: '#168952',
          },
        });
      });
  }

  confirmChanges(): void {
    const dialogRef = this.dialog.open(ConfirmChangesComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.orderService
            .changeStatus()
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                if (err.status === 422) {
                  this.toast.show('This status cannot be changed!', {
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

                this.getOrderData();
                throw err;
              })
            )
            .subscribe(() => this.eventService.event$.next(''));
        }
      });
  }

  backToPreviousPage(): void {
    this.router
      .navigate(['../../'], { relativeTo: this.activatedRoute })
      .then();
  }

  get isShowCancelBtn(): boolean {
    return (
      this.orderData.status !== OrderStatus.production &&
      this.orderData.status !== OrderStatus.complete &&
      this.orderData.status !== OrderStatus.canceled &&
      this.orderData.status !== OrderStatus.dispatched &&
      this.orderData.status !== OrderStatus.readyForPickup
    );
  }

  get isFreightFirst(): boolean {
    return (
      this.isAdmin &&
      (this.orderData.status === OrderStatus.production ||
        this.orderData.status === OrderStatus.dispatched ||
        this.orderData.status === OrderStatus.readyForPickup ||
        this.orderData.status === OrderStatus.complete ||
        this.orderData.status === OrderStatus.canceled)
    );
  }

  get isTrackingNumber(): boolean {
    return this.isAdmin && this.isDeliveryType;
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }

  get isAllDataLoaded(): boolean {
    return !!(this.orderData && (this.isAdmin ? this.isFilesLoaded : true));
  }

  getDate(date: string): string | null {
    return new DateFormatted(this.datePipe).getDate(date);
  }

  ngOnDestroy(): void {
    this.orderService.statusChangesData = {};
    this.orderService.cancelSubscriptionChanel(this.orderId);
  }
}
