import { Component, Input, ViewEncapsulation } from '@angular/core';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import { WidgetsType } from 'src/app/core/enums/widget-type.enum';
import { IWidgetsProperty } from 'src/app/core/models/compose-product.model';
import { CreateOrderService } from 'src/app/core/services/create-order.service';

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class WidgetsComponent {
  WidgetsType = WidgetsType;
  WidgetsKey = WidgetsKey;

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;
  @Input() jobId: string | null;

  constructor(private orderService: CreateOrderService) {}

  get propertiesType(): WidgetsType | 'combined' {
    const propertiesFirstType = this.properties[0].type;

    return this.properties.every((p) => propertiesFirstType === p.type)
      ? propertiesFirstType
      : 'combined';
  }

  get isLoaded(): boolean {
    return this.orderService.isLoadedWidget.value;
  }
}
