import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { IArtworkItem } from '../models/artwork.model';
import { IFile } from '../models/file.model';
import { IFilterDefaultValues } from '../models/filter.model';
import {
  IOrderDetails,
  IOrderItem,
  IOrderJobDetails,
  IOrderJobItem,
  IStatusChangesData,
} from '../models/orders.model';
import { ITableRequest } from '../models/table.model';
import { API_URL, forAdmin, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { AuthorizationService } from './authorization.service';
import { toSnakeCase } from '../../shared/utils/snake-case.util';
import { JobStatus } from '../enums/status.enum';
import { environment } from 'src/environments/environment';
import { PlatformDetectorService } from './platform-detector.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  public statusChangesData: IStatusChangesData = {} as IStatusChangesData;
  public orderDetails$ = new BehaviorSubject<IOrderDetails | null>(null);
  private pusher: any;

  constructor(
    private readonly apiService: ApiService,
    private authorizationService: AuthorizationService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  getTableData(
    queryParams: string
  ): Observable<ITableRequest<IOrderItem[] | IOrderJobItem[]>> {
    return this.apiService.get(
      forAdmin(this.isAdmin, API_URL.ORDERS) + queryParams
    );
  }

  getOrdersFilter(): Observable<IFilterDefaultValues> {
    return this.apiService.get(forAdmin(this.isAdmin, API_URL.ORDER_FILTER));
  }

  getOrder(orderId: string): Observable<IOrderDetails> {
    return this.apiService.get(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.ORDER_BY_ID), {
        orderId,
      })
    );
  }

  exportOrder(orderId: string): Observable<any> {
    return this.apiService.getBlob(
      UrlGenerator.generate(API_URL.ORDER_EXPORT, {
        orderId,
      }),
      'text/xml'
    );
  }

  getJob(jobId: string): Observable<IOrderJobDetails> {
    return this.apiService.get(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.ORDER_JOB), {
        jobId,
      })
    );
  }

  copyJob(jobId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.ORDER_JOB_COPY, {
        jobId,
      })
    );
  }

  deleteJob(jobId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.ORDER_JOB, {
        jobId,
      })
    );
  }

  getOrderPdf(orderId: string): Observable<File> {
    return this.apiService.getBlob(
      UrlGenerator.generate(API_URL.ORDER_PDF, {
        orderId,
      })
    );
  }

  getCompanyLogoPdf(orderId: string): Observable<File> {
    return this.apiService.getBlob(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.COMPANY_LOGO_PDF), {
        orderId,
      })
    );
  }

  getSupportDocumentPdf(orderId: string): Observable<File> {
    return this.apiService.getBlob(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.SUPPORT_DOC_PDF), {
        orderId,
      })
    );
  }

  getPickupLabelPdf(orderId: string): Observable<File> {
    return this.apiService.getBlob(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.PICKUP_LABEL_PDF), {
        orderId,
      })
    );
  }

  getPrintPdf(orderId: string): Observable<IFile> {
    return this.apiService.get(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.PRINT_PDF), {
        orderId,
      })
    );
  }

  cancelOrder(orderId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.ORDER_CANCEL, { orderId })
    );
  }

  acceptAllProofs(orderId: string): Observable<IArtworkItem[]> {
    return this.apiService
      .post(UrlGenerator.generate(API_URL.ACCEPT_ALL_PROOFS, { orderId }))
      .pipe(map((d) => d.artworks));
  }

  rejectArtwork(jobId: string, artworkId: string): Observable<IArtworkItem[]> {
    return this.apiService
      .post(
        UrlGenerator.generate(API_URL.CHANGE_ARTWORK_STATUS, {
          jobId,
          artworkId,
        }),
        { isAccepted: false }
      )
      .pipe(map((d) => d.artworks));
  }

  acceptArtworkByAdmin(
    jobId: string,
    artworkId: string
  ): Observable<IArtworkItem[]> {
    return this.apiService
      .post(
        UrlGenerator.generate(API_URL.ADMIN_ACCEPT_ARTWORK, {
          jobId,
          artworkId,
        })
      )
      .pipe(map((d) => d.artworks));
  }

  rejectArtworkByAdmin(
    jobId: string,
    artworkId: string,
    data: { comment: string }
  ): Observable<IArtworkItem[]> {
    return this.apiService
      .post(
        UrlGenerator.generate(API_URL.ADMIN_REJECT_ARTWORK, {
          jobId,
          artworkId,
        }),
        data
      )
      .pipe(map((d) => d.artworks));
  }

  reUploadArtwork(
    jobId: string,
    artworkId: string,
    data?: { file?: any; email?: string; extraEmail?: string }
  ): Observable<IArtworkItem[]> {
    return this.apiService
      .postFormData(
        UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.UPLOAD_ARTWORK), {
          jobId,
          artworkId,
        }),
        data
      )
      .pipe(map((d) => d.artworks));
  }

  changeStatus(ids?: string[]): Observable<{ message: string }> {
    if (ids) {
      const status = this.statusChangesData?.orders
        ? toSnakeCase(this.statusChangesData?.orders[0].newStatus)
        : '';
      const data = {
        selected: ids,
        status,
      };

      return this.apiService.put(API_URL.ORDER_STATUSES, data);
    }

    const orderStatus = toSnakeCase(
      this.statusChangesData.order?.newStatus || ''
    );
    const data = {
      ...(orderStatus && {
        orderId: this.statusChangesData.order?.id,
        orderStatus,
      }),
      ...(this.isJobStatusesChanged && {
        jobs: this.statusChangesData.jobs
          ?.filter((j) => j.newStatus)
          .map((j) => {
            return { id: j.id, status: toSnakeCase(j.newStatus) };
          }),
      }),
    };

    return this.apiService.post(API_URL.ORDERS_STATUS, data);
  }

  trimboxArtwork(
    jobId: string,
    artworkId: string
  ): Observable<{ message: string }> {
    return this.apiService
      .post(
        UrlGenerator.generate(API_URL.TRIM, {
          jobId,
          artworkId,
        })
      )
      .pipe(map((d) => d.artworks));
  }

  autoScaleArtwork(
    jobId: string,
    artworkId: string
  ): Observable<{ message: string }> {
    return this.apiService
      .post(
        UrlGenerator.generate(API_URL.SCALE, {
          jobId,
          artworkId,
        })
      )
      .pipe(map((d) => d.artworks));
  }

  rotateArtwork(
    jobId: string,
    artworkId: string
  ): Observable<{ message: string }> {
    return this.apiService
      .post(
        UrlGenerator.generate(API_URL.ROTATE, {
          jobId,
          artworkId,
        })
      )
      .pipe(map((d) => d.artworks));
  }

  connectPusher(orderId: string): void {
    this.authorizationService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn && this.platformDetectorService.isBrowser()) {
        import('pusher-js/with-encryption').then((p) => {
          this.pusher = new p.default(environment.pusher_key, {
            cluster: 'mt1',
            wsHost: environment.wsHost,
            wsPort: 6001,
            forceTLS: false,
            enabledTransports: ['ws'],
            channelAuthorization: {
              transport: 'ajax',
              endpoint: environment.pusher_url + '/broadcasting/auth',
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + this.authorizationService.token,
              },
            },
          });
  
          const channel = this.pusher.subscribe('private-orders.' + orderId);
  
          channel.bind('order-details-updated', (orderDetails: IOrderDetails) => {
            this.orderDetails$.next(orderDetails);
          });
        });
      }
    });
  }

  cancelSubscriptionChanel(orderId: string): void {
    if (this.platformDetectorService.isBrowser()) {
      this.pusher.unsubscribe('private-orders.' + orderId);
      this.orderDetails$.next(null);
    }
  }

  updateMaps(orderId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.UPDATE_MAPS, { orderId })
    );
  }

  saveTrackingNumber(
    orderId: string,
    deliveryTracking: number
  ): Observable<{ message: string }> {
    return this.apiService.post(
      forAdmin(this.isAdmin, API_URL.SAVE_DELIVERY_NUMBER),
      {
        orderId,
        deliveryTracking,
      }
    );
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }

  get isConfirmBtnActive(): boolean {
    return !!(
      (this.statusChangesData.order &&
        this.statusChangesData.order.newStatus) ||
      this.isJobStatusesChanged
    );
  }

  get isJobStatusesChanged(): boolean {
    return !!this.statusChangesData.jobs?.find((j) => j.newStatus);
  }

  isJobStatusCanceled(jobStatus: JobStatus): boolean {
    return jobStatus === JobStatus.canceled;
  }
}
