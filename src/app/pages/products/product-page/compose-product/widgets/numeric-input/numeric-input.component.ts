import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { pairwise, startWith, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { InfoNotificationTypeEnum } from 'src/app/core/enums/notification.enum';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import { WidgetsType } from 'src/app/core/enums/widget-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  IWidgetPostData,
  IWidgetsProperty,
} from 'src/app/core/models/compose-product.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CreateOrderService } from 'src/app/core/services/create-order.service';
import {
  maxValueValidator,
  minValueValidator,
} from 'src/app/shared/utils/custom-validators';
import { numberMask, onlyNumberMask } from 'src/app/shared/utils/masks';

const MIN_VALUE = 1;
const MAX_VALUE = 100000;

@Component({
  selector: 'app-numeric-input',
  templateUrl: './numeric-input.component.html',
  styleUrls: ['./numeric-input.component.less'],
  providers: [AutoDestroyService],
})
export class NumericInputComponent implements OnInit {
  NUMBER_MASK = numberMask;
  FIELD_TYPES = FieldTypes;
  NotificationType = InfoNotificationTypeEnum;
  WidgetsType = WidgetsType;
  WidgetsKey = WidgetsKey;

  dataToSave: IWidgetPostData;
  form: FormGroup;
  errorText: string = '';
  warningText: string = '';
  isUnlimited: boolean;

  get buttonNextConfig(): IButtonConfig {
    return {
      text: 'Next',
      viewType: ButtonViewType.Filled,
      minWidth: '340px',
      isDisabled: this.form.invalid || !!this.errorText.length,
    };
  }

  get activeProperties(): IWidgetsProperty[] {
    return this.properties.filter(
      (p) => !Object.prototype.hasOwnProperty.call(p, 'isActive') || p.isActive
    );
  }

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;
  @Input() isCombinedWidget: boolean;

  @Output() changeEvent = new EventEmitter<IWidgetPostData>();

  constructor(
    private orderService: CreateOrderService,
    private formBuilder: FormBuilder,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group(
      this.activeProperties.reduce((a, p) => {
        const minValue = this.getItemByKey(p.key)?.min;
        const maxValue = this.getItemByKey(p.key)?.max;

        return {
          ...a,
          [p.key]: [
            (p?.selectedValue || '').toString(),
            [
              Validators.required,
              minValue
                ? minValueValidator(
                    minValue,
                    this.getErrorTextMinValue(minValue)
                  )
                : () => null,
              maxValue
                ? maxValueValidator(
                    maxValue,
                    this.getErrorTextMaxValue(maxValue)
                  )
                : () => null,
            ],
          ],
        };
      }, {})
    );

    if (this.widgetKey === WidgetsKey.Size) {
      const minWidth = this.getItemByKey(WidgetsKey.Width)?.min || MIN_VALUE;
      const minHeight = this.getItemByKey(WidgetsKey.Height)?.min || MIN_VALUE;
      const maxValue = Math.max(
        this.getItemByKey(WidgetsKey.Height)?.max || MAX_VALUE,
        this.getItemByKey(WidgetsKey.Width)?.max || MAX_VALUE
      );

      this.form
        .get('width')
        ?.setValidators([
          Validators.required,
          minValueValidator(minWidth, this.getErrorTextMinValue(minWidth)),
          maxValueValidator(maxValue, this.getErrorTextMaxValue(maxValue)),
        ]);

      this.form
        .get('height')
        ?.setValidators([
          Validators.required,
          minValueValidator(minHeight, this.getErrorTextMinValue(minHeight)),
          maxValueValidator(maxValue, this.getErrorTextMaxValue(maxValue)),
        ]);
    }

    if (this.widgetKey === WidgetsKey.Quantity) {
      this.isUnlimited = !!this.properties.find(p => p.key === WidgetsKey.Kind)?.isUnlimited;

      if (this.isUnlimited) {
        this.form.get(WidgetsKey.Kind)?.setValue('1 or more');
        this.form.get(WidgetsKey.Kind)?.setValidators([]);
      } else {
        this.form.addControl('totalQuantity', new FormControl(0));
        this.calcTotalQuantity();
      }
    }

    this.subscribeToFormChanges();
  }

  subscribeToFormChanges(): void {
    this.form.valueChanges
      .pipe()
      .pipe(startWith(this.form.value), pairwise(), takeUntil(this.destroy$))
      .subscribe(([prevValue, value]: [any, any]) => {
        if (JSON.stringify(prevValue) === JSON.stringify(value)) {
          return;
        }

        if (this.widgetKey === WidgetsKey.Size) {
          this.proportionsSizeValidation();
        }

        if (this.widgetKey === WidgetsKey.Quantity) {
          this.calcTotalQuantity(); 
        }

        if (this.errorText) {
          return;
        }

        const properties = this.activeProperties.map((p) => {
          return {
            propertyKey: p.key,
            value: this.form.invalid ? '' 
              : value[p.key] === '1 or more' ? value[p.key]
              : onlyNumberMask(value[p.key], true),
          };
        });

        this.dataToSave = {
          stepKey: this.widgetKey,
          properties,
        };

        this.changeEvent.emit(this.dataToSave);
      });
  }

  proportionsSizeValidation(): void {
    const width = +onlyNumberMask(this.form.get('width')?.value);
    const height = +onlyNumberMask(this.form.get('height')?.value);
    const minValue = Math.min(
      this.getItemByKey(WidgetsKey.Height)?.max || MAX_VALUE,
      this.getItemByKey(WidgetsKey.Width)?.max || MAX_VALUE
    );
    const maxValue = Math.max(
      this.getItemByKey(WidgetsKey.Height)?.max || MAX_VALUE,
      this.getItemByKey(WidgetsKey.Width)?.max || MAX_VALUE
    );
    const chargeableMinWidth = this.getItemByKey(WidgetsKey.Width)?.chargeableMinWidth || 0;
    const chargeableMinHeight = this.getItemByKey(WidgetsKey.Height)?.chargeableMinHeight || 0;

    const isInvalidProportions =
      (width === maxValue && height > minValue) ||
      (height === maxValue && width > minValue) ||
      width + height > minValue + maxValue ||
      (width > minValue && height > minValue);
    const isInvalidMinSize = this.form.valid && (width < chargeableMinWidth || height < chargeableMinHeight);

    this.errorText = isInvalidProportions
      ? `Maximum dimensions is ${minValue} by ${maxValue}` : '';
    this.warningText = isInvalidMinSize
      ? `The size you entered is below our minimum chargeable dimensions. A minimum size charge will apply: ${chargeableMinWidth}mm x ${chargeableMinHeight}mm` : ''
  }

  getItemByKey(key: WidgetsKey): IWidgetsProperty | undefined {
    return this.activeProperties.find((p) => p.key === key);
  }

  getErrorTextMinValue(value: number): string {
    return `The value is too low. Min value is ${numberMask(value)}`;
  }

  getErrorTextMaxValue(value: number): string {
    return `The value is too high. Max value is ${numberMask(value)}`;
  }

  saveData(): void {
    this.orderService.widgetDataToSave.next(this.dataToSave);
  }

  calcTotalQuantity(): void {
    const quantity = this.form.get(this.activeProperties[0].key)?.value || 0;
    const kind = this.form.get(this.activeProperties[1].key)?.value;
    const results = +onlyNumberMask(quantity) * kind;

    this.form.get('totalQuantity')?.setValue(results);
  }

  getTitle(property: IWidgetsProperty): string {
    return property.key === WidgetsKey.Quantity && this.isUnlimited
      ? 'Total quantity'
      : property.title;
  }

  get isShowTotalQuantity(): boolean {
    return this.widgetKey === WidgetsKey.Quantity && !this.isUnlimited;
  }
}
