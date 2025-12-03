import { Component, Input, OnInit } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { InfoNotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  IWidgetPostData,
  IWidgetsOption,
  IWidgetsProperty,
} from 'src/app/core/models/compose-product.model';
import { CreateOrderService } from 'src/app/core/services/create-order.service';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.less'],
})
export class RadioComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  NotificationType = InfoNotificationTypeEnum;
  selectedOptionId: string | number;
  selectedOptionsKey: string = '';

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;

  get buttonNextConfig(): IButtonConfig {
    return {
      text: 'Next',
      viewType: ButtonViewType.Filled,
      minWidth: '340px',
      isDisabled: !this.selectedOptionId,
    };
  }

  constructor(private orderService: CreateOrderService) {}

  ngOnInit(): void {
    this.selectedOptionId = this.properties[0].selectedOptionId;
    const selectedOption = this.properties[0].options.find(o => o.id === this.selectedOptionId);
    this.selectedOptionsKey = selectedOption?.key || '';
  }

  onSelectOption(event: Event, option: IWidgetsOption): void {
    if ((event.target as HTMLAnchorElement)?.tagName.toLowerCase() === 'a') {
      return;
    }

    this.selectedOptionsKey = option.key;
    this.selectedOptionId = option.id;

    if (this.isHandAppliedOption) {
      return;
    }
    
    this.saveData();    
  }

  saveData(): void {
    const dataToSave: IWidgetPostData = {
      stepKey: this.widgetKey,
      properties: [
        {
          propertyKey: this.properties[0].key,
          optionId: this.selectedOptionId,
        },
      ],
    };

    this.orderService.widgetDataToSave.next(dataToSave);
  }

  get warningText(): string {
    return this.properties[0].label;
  }

  get isDisplayWarning(): boolean {
    if (!this.warningText) return false;

    const isApplicationMethod = this.widgetKey === WidgetsKey.ApplicationMethod;

    return isApplicationMethod ? this.isHandAppliedOption : true;
  }

  // Application Method
  get isHandAppliedOption(): boolean {
    return this.selectedOptionsKey === WidgetsKey.HandAappliedKey;
  }

  get isDisplayBtn(): boolean {
    return this.isDisplayWarning;
  }

  confirmSaving(): void {
    this.saveData();
  }
}
