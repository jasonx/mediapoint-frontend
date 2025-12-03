import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil,
} from 'rxjs';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { InfoNotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import {
  ICheaperConfig,
  IQuantityPrice,
  IQuantityPricePostData,
  IWidgetPostData,
  IWidgetPostProperties,
  IWidgetsProperty,
} from 'src/app/core/models/compose-product.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CreateOrderService } from 'src/app/core/services/create-order.service';
import { numberMask, onlyNumberMask } from 'src/app/shared/utils/masks';

@Component({
  selector: 'app-quantity',
  templateUrl: './quantity.component.html',
  styleUrls: ['./quantity.component.less'],
})
export class QuantityComponent implements OnInit {
  NUMBER_MASK = numberMask;
  FIELD_TYPES = FieldTypes;
  NOTIFICATION_TYPE = InfoNotificationTypeEnum;

  dataToSave: IWidgetPostData;
  isLoaded: boolean = true;
  cheaperConfig: ICheaperConfig;

  getPricingSubject$ = new Subject<IWidgetPostData>();

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;
  @Input() jobId: string | null;

  @Output() changeEvent = new EventEmitter<IWidgetPostData>();

  constructor(
    private orderService: CreateOrderService,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.initDataToSave();
    this.calculatePrice();

    this.getPricingSubject$
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.calculatePrice());
  }

  initDataToSave(): void {
    this.dataToSave = {
      properties: this.properties.map((p) => {
        return {
          propertyKey: p.key,
          ...(p.selectedValue && {
            value: p.selectedUnlimitedValue ? '1 or more' : p.selectedValue,
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

    this.getPricingSubject$.next(data);
  }

  calculatePrice(): void {
    const quantity = +onlyNumberMask(
      this.dataToSave.properties.find(
        (p) => p.propertyKey === WidgetsKey.Quantity
      )?.value
    );
    const numberOfKinds = this.dataToSave.properties.find(
      (p) => p.propertyKey === WidgetsKey.Kind
    )?.value;

    if (!this.jobId || !quantity || !numberOfKinds) {
      this.orderService.isCanAddToCart = false;

      return;
    }

    this.isLoaded = false;
    const isUnlimited = numberOfKinds === '1 or more';
    const postData: IQuantityPricePostData = {
      quantity,
      numberOfKinds: isUnlimited ? 1 : +numberOfKinds,
      unlimitedKinds: isUnlimited,
    };

    this.orderService
      .calculatePrice(this.jobId, postData)
      .pipe(
        catchError((err) => {
          this.orderService.setGlobalError(this.widgetKey, err.error.message);
          this.orderService.isCanAddToCart = false;
          this.isLoaded = true;

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data: IQuantityPrice) => {
        this.cheaperConfig = data.cheaperConfiguration;
        this.orderService.resetGlobalError();
        this.isLoaded = true;
      });
  }

  onChangePreviousData(): void {
    this.orderService.widgetDataToSave.next(
      this.cheaperConfig.stepConfiguration
    );
  }

  get errorText(): string {
    return this.orderService.getGlobalError(this.widgetKey);
  }
}
