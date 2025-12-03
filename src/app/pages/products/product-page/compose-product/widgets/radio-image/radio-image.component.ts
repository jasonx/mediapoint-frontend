import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import {
  IWidgetPostData,
  IWidgetsOption,
  IWidgetsProperty,
} from 'src/app/core/models/compose-product.model';
import { CreateOrderService } from 'src/app/core/services/create-order.service';

@Component({
  selector: 'app-radio-image',
  templateUrl: './radio-image.component.html',
  styleUrls: ['./radio-image.component.less'],
})
export class RadioImageComponent {
  selectedOptionId: string | number;

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;
  @Input() isCombinedWidget: boolean;

  @Output() changeEvent = new EventEmitter<IWidgetPostData>();

  constructor(private orderService: CreateOrderService) {}

  onSelectOption(event: Event, option: IWidgetsOption): void {
    if ((event.target as HTMLAnchorElement)?.tagName.toLowerCase() === 'a') {
      return;
    }

    this.selectedOptionId = option.id;

    const dataToSave = {
      stepKey: this.widgetKey,
      properties: [
        {
          propertyKey: this.properties[0].key,
          optionId: option.id,
        },
      ],
    };

    this.isCombinedWidget
      ? this.changeEvent.emit(dataToSave)
      : this.orderService.widgetDataToSave.next(dataToSave);
  }

  isSelected(id: string | number): boolean {
    const selectedId =
      this.selectedOptionId || this.properties[0].selectedOptionId;

    return !!selectedId && id === selectedId;
  }
}
