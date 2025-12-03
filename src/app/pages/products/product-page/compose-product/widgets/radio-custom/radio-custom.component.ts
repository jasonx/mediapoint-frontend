import { Component, Input, OnInit } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { WidgetsKey } from 'src/app/core/enums/widget-key.enum';
import { IBaseTitle } from 'src/app/core/models/base.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import {
  IWidgetPostData,
  IWidgetsOption,
  IWidgetsProperty,
} from 'src/app/core/models/compose-product.model';
import { CreateOrderService } from 'src/app/core/services/create-order.service';
import { numberMask } from 'src/app/shared/utils/masks';

const MIN_VALUE = 1;
const MAX_VALUE = 100;
const CUSTOM_ID = 'custom';

@Component({
  selector: 'app-radio-custom',
  templateUrl: './radio-custom.component.html',
  styleUrls: ['./radio-custom.component.less'],
})
export class RadioCustomComponent implements OnInit {
  NUMBER_MASK = numberMask;
  FIELD_TYPES = FieldTypes;
  selectedValue: IBaseTitle;
  selectedOptionId: string | number;
  dataToSave: IWidgetPostData;
  errorValidationText: string = '';

  get buttonNextConfig(): IButtonConfig {
    return {
      text: 'Next',
      viewType: ButtonViewType.Filled,
      minWidth: '340px',
      isDisabled: !!this.errorValidationText || !this.selectedValue.title,
    };
  }

  @Input() properties: IWidgetsProperty[];
  @Input() widgetKey: WidgetsKey;

  constructor(private orderService: CreateOrderService) {}

  ngOnInit(): void {
    this.properties[0].options = this.properties[0].options
      .map((o) => {
        return {
          ...o,
          title: numberMask(o.title),
        };
      })
      .concat({
        id: CUSTOM_ID,
        title: this.properties[0].selectedValue?.toString(),
      } as IWidgetsOption);

    this.setSelectedOption();
  }

  setSelectedOption(): void {
    const selectedOptionId = this.properties[0].selectedOptionId || CUSTOM_ID;

    this.errorValidationText = '';
    this.selectedValue =
      this.properties[0].options.find(
        (o) => o.id === selectedOptionId && o.title
      ) || ({} as IBaseTitle);

    if (this.selectedValue.title) {
      this.onSelectOption(this.selectedValue);
    }
  }

  onSelectOption(selectedValue: IBaseTitle): void {
    this.selectedValue = selectedValue;

    this.selectedValue.id === CUSTOM_ID
      ? this.setCustomValue()
      : this.setStaticValue();
  }

  setCustomValue(): void {
    const value = this.selectedValue.title;

    this.checkCustomValue(value);
    this.dataToSave = {
      stepKey: this.widgetKey,
      properties: [
        {
          propertyKey: this.properties[0].key,
          value,
        },
      ],
    };
  }

  setStaticValue(): void {
    this.dataToSave = {
      stepKey: this.widgetKey,
      properties: [
        {
          propertyKey: this.properties[0].key,
          optionId: +this.selectedValue.id,
        },
      ],
    };
  }

  checkCustomValue(value: string): void {
    const min = this.properties[0].min || MIN_VALUE;
    const max = this.properties[0].max || MAX_VALUE;
    const isSmall = +value < min;
    const isBig = +value > max;

    this.errorValidationText = value
      ? isSmall
        ? `Min value is ${min} mm`
        : isBig
        ? `Max value is ${max} mm`
        : ''
      : '';
  }

  saveData(): void {
    if (this.errorValidationText) {
      return;
    }

    this.orderService.widgetDataToSave.next(this.dataToSave);
  }

  getIsCustomField(id: string | number): boolean {
    return id === CUSTOM_ID;
  }
}
