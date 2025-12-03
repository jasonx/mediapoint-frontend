import { Component, Input, OnInit } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { InfoNotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import { WidgetsType } from 'src/app/core/enums/widget-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  IWidgetPostData,
  IWidgetPostProperties,
  IWidgetsProperty,
} from 'src/app/core/models/compose-product.model';
import { CreateOrderService } from 'src/app/core/services/create-order.service';

@Component({
  selector: 'app-combined',
  templateUrl: './combined.component.html',
  styleUrls: ['./combined.component.less'],
})
export class CombinedComponent implements OnInit {
  WidgetsType = WidgetsType;
  dataToSave: IWidgetPostData;
  NOTIFICATION_TYPE = InfoNotificationTypeEnum;

  get buttonNextConfig(): IButtonConfig {
    return {
      text: 'Next',
      viewType: ButtonViewType.Filled,
      minWidth: '340px',
      isDisabled: this.isDataValid,
    };
  }

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;

  constructor(private orderService: CreateOrderService) {}

  ngOnInit(): void {
    this.initDataToSave();
  }

  initDataToSave(): void {
    const activeProperties = this.properties.filter((p) => p.isActive);

    this.dataToSave = {
      properties: activeProperties.map((p) => {
        return {
          propertyKey: p.key,
          ...(p.selectedValue && {
            value: p.selectedValue,
          }),
          ...(p.selectedOptionId && {
            optionId: p.selectedOptionId,
          }),
        };
      }) as IWidgetPostProperties[],
      stepKey: this.widgetKey,
    };
  }

  changeData(data: IWidgetPostData): void {
    data.properties.forEach((p) => {
      const index = this.dataToSave.properties.findIndex(
        (obj) => p.propertyKey === obj.propertyKey
      );

      this.dataToSave.properties[index] = p;
    });
  }

  saveData(): void {
    if (!this.isDataValid) {
      this.orderService.widgetDataToSave.next(this.dataToSave);
    }
  }

  get isDataValid(): boolean {
    return !this.dataToSave?.properties.every((p) => p.optionId || p.value);
  }

  getPropertiesByType(types: WidgetsType[]): IWidgetsProperty[] {
    return this.properties.filter((p) => types.find((t) => t === p.type));
  }

  get errorText(): string {
    return this.orderService.getGlobalError(this.widgetKey);
  }
}
