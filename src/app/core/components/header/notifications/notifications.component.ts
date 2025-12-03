import { Component, OnDestroy, OnInit } from '@angular/core';
import { IButtonConfig } from '../../../models/button-config.model';
import { ButtonViewType } from '../../../enums/button-view-type.enum';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../services/notifications.service';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from '../../../services/auto-destroy.service';
import { HotToastService } from '@ngneat/hot-toast';
import { INotification } from 'src/app/core/models/notification.model';
import { NotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { NotificationToastComponent } from 'src/app/shared/components/notification-toast/notification-toast.component';
import { AuthorizationService } from 'src/app/core/services/authorization.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.less'],
  providers: [AutoDestroyService],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  NOTIFICATION_TYPE = NotificationTypeEnum;
  notifications: INotification[] = [];
  countNewNotifications: number = 0;
  isOpen: boolean;
  isNotificationsPage: boolean;
  buttonMarkReadConfig: IButtonConfig = {
    text: 'Mark as read',
    viewType: ButtonViewType.Text,
    color: '#1B459B',
  };
  buttonViewAllConfig: IButtonConfig = {
    text: 'See all notifications',
    viewType: ButtonViewType.LightBlue,
    minWidth: '100%',
  };

  constructor(
    private router: Router,
    private notificationsService: NotificationsService,
    private authService: AuthorizationService,
    public destroy$: AutoDestroyService,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.authService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data) {
          return;
        }

        this.getNotifications();
      });

    this.subscribeToNotifications();
    this.subscribeToNotifPage();
  }

  getNotifications(): void {
    this.notificationsService
      .getNotificationsList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.notifications = data.data;
        this.countNewNotifications = data.notSeenNotificationsCount;
      });
  }

  subscribeToNotifications(): void {
    this.notificationsService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification: INotification) => {
        if (notification.id) {
          this.showToast(notification);
          this.notifications = [notification, ...this.notifications];
          ++this.countNewNotifications;
        }
      });

    this.notificationsService.changeNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification: INotification | null) => {
        if (notification) {
          this.readNotification(notification.id);
        }
      });
  }

  subscribeToNotifPage(): void {
    this.notificationsService.isNotificationsPage.subscribe(
      (isNotificationsPage) => (this.isNotificationsPage = isNotificationsPage)
    );
  }

  onOpen(): void {
    if (this.authService.isLoggedIn) {
      this.isOpen = !this.isOpen;
      this.markSeen();
      this.toast.close();
    } else {
      this.authService.goToLogout();
    }
  }

  onClose(): void {
    this.isOpen = false;
  }

  markSeen(): void {
    if (!this.countNewNotifications) {
      return;
    }

    this.notificationsService
      .seenNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.countNewNotifications = 0;
      });
  }

  markRead(item: INotification): void {
    this.notificationsService
      .readNotification([item.id])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.readNotification(item.id);
        this.navigateToOrderPage(item);
      });
  }

  readNotification(id: number): void {
    this.notifications = this.notifications.map((n) => {
      return n.id === id ? { ...n, isRead: true } : n;
    });
  }

  markReadAll(): void {
    this.notificationsService
      .readAllNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.notifications = this.notifications.map((n) => {
          return {
            ...n,
            isRead: true,
          };
        });
      });
  }

  navigateToOrderPage(item: INotification): void {
    const orderId = this.notificationsService.getOrderId(item);
    const jobId = item.jobId;

    this.onClose();
  
    if (orderId) {
      this.router.navigate(['./orders/order', orderId]).then();
    } else if (jobId) {
      this.router.navigate(['./cart/artwork-details', jobId]).then();
    }
  }

  onClickNotification(item: INotification): void {
    item.isRead ? this.navigateToOrderPage(item) : this.markRead(item);
  }

  viewAll(): void {
    this.router.navigate(['./notifications']).then();
    this.onClose();
  }

  showToast(data: INotification): void {
    this.toast.show<INotification>(NotificationToastComponent, {
      position: 'top-right',
      duration: 5000,
      className: 'notification',
      style: {
        border: 'none',
        borderRadius: '6px',
        margin: '90px 40px',
        padding: '0',
        minWidth: '388px',
        display: 'block',
        width: '100%',
      },
      data,
    });
  }

  getDate(date: string): string {
    return this.notificationsService.getFormatedDate(date);
  }

  ngOnDestroy(): void {
    this.notificationsService.notifications$.next({} as INotification);
    this.toast.close();
  }
}
