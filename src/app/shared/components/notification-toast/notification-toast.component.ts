import { Component, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastRef } from '@ngneat/hot-toast';
import { takeUntil } from 'rxjs';
import { NotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { INotification } from 'src/app/core/models/notification.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.less'],
  providers: [AutoDestroyService],
})
export class NotificationToastComponent {
  TYPE = NotificationTypeEnum;

  constructor(
    @Optional()
    @Inject(HotToastRef)
    public toastRef: HotToastRef<INotification>,
    private notificationsService: NotificationsService,
    private router: Router,
    private destroy$: AutoDestroyService
  ) {}

  getOrderId(item: INotification): string {
    return this.notificationsService.getOrderId(item);
  }

  onClose(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toastRef.close({ dismissedByAction: true });
  }

  onClickNotification(item: INotification): void {
    this.notificationsService
      .readNotification([item.id])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const orderId = this.notificationsService.getOrderId(item);
        const jobId = item.jobId;

        this.toastRef.close();

        if (orderId) {
          this.router.navigate(['./orders/order', orderId]).then();
        } else if (jobId) {
          this.router.navigate(['./cart/artwork-details', jobId]).then();
        }
      });
  }
}
