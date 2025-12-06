import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthorizationService } from './authorization.service';
import {
  INotification,
  INotificationsResponse,
} from '../models/notification.model';
import { ApiService } from './api.service';
import { API_URL } from './api-urls';
import { environment } from 'src/environments/environment';
import { toCamelObj } from 'src/app/shared/utils/camel';
import { DatePipe } from '@angular/common';
import { PlatformDetectorService } from './platform-detector.service';
import { NotificationTypeEnum } from '../enums/notification.enum';
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<INotification> = new BehaviorSubject(
    {} as INotification
  );
  public changeNotification$: BehaviorSubject<INotification | null> =
    new BehaviorSubject<INotification | null>(null);
  public isNotificationsPage: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(
    private apiService: ApiService,
    private authorizationService: AuthorizationService,
    private datePipe: DatePipe,
    private platformDetectorService: PlatformDetectorService
  ) {
    this.connectPusher();

    // For test
    // setTimeout(() => {
    //   // this.sendNotificationForTest();
    //   this.notifications$.next({
    //     // body: 'There is a proof awaiting your approval for order <a href="/orders/order/2230">2230</a>',
    //     body: 'Artwork error!',
    //     createdAt: new Date().getTime() + '',
    //     id: 1,
    //     isRead: false,
    //     isSeen: false,
    //     title: 'Order is dispatched',
    //     type: NotificationTypeEnum.Error,
    //     jobId: 10464,
    //     // orderId: 2230,
    //   });
    // }, 3000);
  }

  getNotificationsList(
    queryParams: string = ''
  ): Observable<INotificationsResponse> {
    return this.apiService.get(API_URL.NOTIFICATIONS + queryParams);
  }

  connectPusher(): void {
    this.authorizationService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn && this.platformDetectorService.isBrowser()) {
        import('pusher-js/with-encryption').then((p) => {
          const pusher = new p.default(environment.pusher_key, {
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
          const channel = pusher.subscribe(
            'private-user-notifications.' + this.authorizationService.userId
          );
  
          channel.bind('in-app-notification', (notification: INotification) => {
            this.notifications$.next(toCamelObj(notification));
          });
        });
      }
    })
  }

  seenNotifications(): Observable<{ message: string }> {
    return this.apiService.post(API_URL.NOTIFICATIONS_SEEN);
  }

  readNotification(notificationIds: number[]): Observable<{ message: string }> {
    return this.apiService.post(API_URL.NOTIFICATIONS_READ_ONE, {
      selected: notificationIds,
    });
  }

  readAllNotifications(): Observable<{ message: string }> {
    return this.apiService.post(API_URL.NOTIFICATIONS_READ_ALL);
  }

  getOrderId(notification: INotification): string {
    if (notification.orderId) {
      return notification.orderId.toString();
    } else {
      const regexp = new RegExp('>(.*)</a>');
      const arr = notification.body.match(regexp);

      return arr ? arr[1] : '';
    }
  }

  getFormatedDate(date: string): string {
    const format = 'dd/MM/YYY';
    const currentDate = this.datePipe.transform(date, format) as string;
    const today = this.datePipe.transform(new Date(), format);
    const yesterday = this.datePipe.transform(
      new Date(new Date().setDate(new Date().getDate() - 1)),
      format
    );
    const shortTime = this.datePipe.transform(date, 'shortTime');

    if (currentDate === today) {
      return 'Today at ' + shortTime;
    } else if (currentDate === yesterday) {
      return 'Yesterday at ' + shortTime;
    }

    return currentDate;
  }

  sendNotificationForTest(): void {
    this.apiService.getSocket('798').subscribe();
  }
}
