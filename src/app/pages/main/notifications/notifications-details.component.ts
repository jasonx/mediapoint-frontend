import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FieldTypes } from '../../../core/enums/field-type.enum';
import { NotificationsService } from '../../../core/services/notifications.service';
import { Subscription, takeUntil } from 'rxjs';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { INotification } from 'src/app/core/models/notification.model';
import { IQueryParams } from 'src/app/core/models/query-params.model';
import { OrderDirection } from 'src/app/core/enums/order-direction.enum';
import { ActivatedRoute, Router } from '@angular/router';
import {
  fromCamel,
  fromCamelObj,
  toCamel,
  toCamelObj,
} from 'src/app/shared/utils/camel';
import { removeEmptyFromObj } from 'src/app/shared/utils/remove-empty';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-notifications-details',
  templateUrl: './notifications-details.component.html',
  styleUrls: ['./notifications-details.component.less'],
  providers: [AutoDestroyService],
})
export class NotificationsDetailsComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  filtersForm: FormGroup;
  totalItems = 0;
  isFiltering: boolean;
  isDataLoaded: boolean;
  isDataReloaded: boolean;
  FIELD_TYPES = FieldTypes;
  params: IQueryParams = {
    orderBy: 'id',
    orderDirection: OrderDirection.DESC,
    perPage: 10,
    currentPage: 1,
  };

  constructor(
    private formBuilder: FormBuilder,
    private notificationsService: NotificationsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initParams();
    this.subscribeForm();
    this.notificationsService.isNotificationsPage.next(true);
  }

  initParams(): void {
    let subscription: Subscription;

    subscription = this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (subscription) {
          subscription.unsubscribe();

          return;
        }

        if (Object.keys(params).length) {
          this.params = toCamelObj(params);
          this.setTypeToForm();
        }

        this.updateUrl();
      });
  }

  updateUrl(): void {
    this.params = removeEmptyFromObj(this.params) as IQueryParams;
    const queryParams = fromCamelObj(this.params) || {};
    const queryString =
      '?' +
      Object.keys(queryParams)
        .map((key: string) => key + '=' + queryParams[key])
        .join('&');

    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      })
      .then(() => this.getData(queryString));
  }

  initForm(): void {
    this.filtersForm = this.formBuilder.nonNullable.group({
      proofReady: [false],
      orderDispatched: [false],
      orderStatusChanged: [false],
      artworkError: [false],
      proofAwaitingApproval: [false],
    });
  }

  setTypeToForm(): void {
    if (!this.params.type) {
      return;
    }

    this.params.type
      .split(',')
      .map((t) => this.filtersForm.get(toCamel(t))?.setValue(true));
  }

  getData(queryString?: string) {
    this.notificationsService
      .getNotificationsList(queryString)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.totalPages && this.params.currentPage > data.totalPages) {
          this.params.currentPage = data.totalPages;
          this.updateUrl();
        }

        this.totalItems = data.totalItems;
        this.notifications = data.data;
        this.isFiltering = !!this.params.type;
        this.isDataLoaded = true;
        this.isDataReloaded = true;
      });
  }

  subscribeForm(): void {
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { [key: string]: boolean }) => {
        const type: string[] = [];

        this.isDataReloaded = false;
        Object.entries(data).map(([key, value]) => {
          if (value) {
            type.push(fromCamel(key));
          }
        });

        this.params = {
          ...this.params,
          type: type.join(','),
        };
        this.updateUrl();
      });
  }

  onChangePage(page: PageEvent): void {
    this.isDataReloaded = false;
    this.params.currentPage = page.pageIndex + 1;
    this.updateUrl();
  }

  markRead(item: INotification): void {
    this.notificationsService
      .readNotification([item.id])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.notifications = this.notifications.map((n) => {
          return n.id === item.id ? { ...n, isRead: true } : n;
        });

        this.notificationsService.changeNotification$.next(item);
        this.navigateToOrderPage(item);
      });
  }

  navigateToOrderPage(item: INotification): void {
    const orderId = this.notificationsService.getOrderId(item);
    const jobId = item.jobId;

    if (orderId) {
      this.router.navigate(['./orders/order', orderId]).then();
    } else if (jobId) {
      this.router.navigate(['./cart/artwork-details', jobId]).then();
    }
  }

  onClickNotification(item: INotification): void {
    item.isRead ? this.navigateToOrderPage(item) : this.markRead(item);
  }

  getDate(date: string): string {
    return this.notificationsService.getFormatedDate(date);
  }

  ngOnDestroy(): void {
    this.notificationsService.isNotificationsPage.next(false);
  }
}
