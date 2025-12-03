import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { InfoNotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';

@Component({
  selector: 'app-notification-block',
  templateUrl: './notification-block.component.html',
  styleUrls: ['./notification-block.component.less'],
})
export class NotificationBlockComponent {
  @Input() type: InfoNotificationTypeEnum = InfoNotificationTypeEnum.Info;
  @Input() text: string;
  @Input() set buttonText(buttonText: string) {
    this.buttonConfig.text = buttonText;
  }
  @Output() clickEvent: EventEmitter<null> = new EventEmitter();

  NOTIFICATION_TYPE = InfoNotificationTypeEnum;

  buttonConfig: IButtonConfig = {
    text: '',
    viewType: ButtonViewType.Link,
  };

  onClickEvent(): void {
    this.clickEvent.emit();
  }
}
