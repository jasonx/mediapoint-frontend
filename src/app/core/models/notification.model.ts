import { NotificationTypeEnum } from '../enums/notification.enum';
import { ITableRequest } from './table.model';

export interface INotificationsSettingsItem {
  type: string;
  title: string;
  enabled: boolean;
}

export interface INotification {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  isSeen: boolean;
  type: NotificationTypeEnum;
  jobId?: number;
  orderId?: number;
}

export interface INotificationsResponse extends ITableRequest<INotification[]> {
  notSeenNotificationsCount: number;
}
