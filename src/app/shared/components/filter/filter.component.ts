import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { withoutLettersMask, onlyNumberMask } from '../../utils/masks';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { IFilterConfig, IFilter } from 'src/app/core/models/filter.model';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { removeEmptyFromObj } from '../../utils/remove-empty';
import { ActivatedRoute } from '@angular/router';
import { delay, of, Subscription, takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { toCamelObj } from '../../utils/camel';
import { IQueryParams } from 'src/app/core/models/query-params.model';
import { titleCase } from '../../utils/title-case';

export const MY_FORMATS = {
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'MMMM',
  },
};

const MIN = 0;
const MAX = 10000;

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.less'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    CurrencyPipe,
    AutoDestroyService,
  ],
})
export class FilterComponent {
  @Input() set setFilterConfig(filterConfig: IFilterConfig) {
    if (!filterConfig.isLoaded) {
      return;
    }

    this.filterConfig = {
      ...filterConfig,
      ...(filterConfig.isFilterPrise
        ? {
            minPrice: Math.floor(filterConfig.minPrice || MIN),
            maxPrice: Math.ceil(filterConfig.maxPrice || MAX),
          }
        : {}),
    };

    this.initQueryParams();
  }
  @Output() searchEvent = new EventEmitter<{
    data: IFilter;
    isReload?: boolean;
  }>();
  @ViewChild('sliderTrack') sliderTrack: ElementRef;

  FIELD_TYPES = FieldTypes;
  WITHOUT_LETTERS_MASK = withoutLettersMask;
  filterConfig: IFilterConfig = { isLoaded: false };
  filterButtonConfig: IButtonConfig = {
    text: 'Filter',
    viewType: ButtonViewType.LightBlue,
    padding: '21px 41px',
    icon: 'filter.svg',
  };
  resultsButtonConfig: IButtonConfig = {
    text: 'Show result',
    viewType: ButtonViewType.Filled,
  };
  clearButtonConfig: IButtonConfig = {
    text: 'Clear all',
    viewType: ButtonViewType.LightBlue,
  };
  form: FormGroup;
  queryParams: IFilter;
  isOpen: boolean;
  valueRange: { min: number; max: number };

  constructor(
    private renderer: Renderer2,
    private activatedRoute: ActivatedRoute,
    private destroy$: AutoDestroyService,
    public formBuilder: FormBuilder
  ) {}

  initQueryParams(): void {
    if (this.form) {
      return;
    }

    let subscription: Subscription;

    subscription = this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => {
        if (subscription) {
          subscription.unsubscribe();

          return;
        }

        const params: IQueryParams = toCamelObj(p);
        const types = params?.typeOfPrint;
        const customers = params?.customer;

        this.queryParams = removeEmptyFromObj({
          status: titleCase(params?.status),
          startDate: params?.createdAtFrom || params?.dispatchEtaAtFrom,
          endDate: params?.createdAtTo || params?.dispatchEtaAtTo,
          priceFrom: params?.priceFrom,
          priceTo: params?.priceTo,
          productSizeFrom: params?.productSizeFrom,
          productSizeTo: params?.productSizeTo,
          quantityFrom: params?.quantityFrom,
          quantityTo: params?.quantityTo,
          typeOfPrint: types
            ? this.filterConfig.typeOfPrint?.find((t) => t.id === +types)
            : '',
          customer: customers
            ? this.filterConfig.customers?.find((c) => c.id === +customers)
            : '',
        });

        this.initForm();
      });
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      status: [this.queryParams?.status || ''],
      startDate: [this.queryParams?.startDate || ''],
      endDate: [this.queryParams?.endDate || ''],
      priceFrom: [
        this.queryParams?.priceFrom || this.filterConfig?.minPrice || '',
      ],
      priceTo: [this.queryParams?.priceTo || this.filterConfig?.maxPrice || ''],
      productSizeFrom: [this.queryParams?.productSizeFrom || ''],
      productSizeTo: [this.queryParams?.productSizeTo || ''],
      quantityFrom: [this.queryParams?.quantityFrom || ''],
      quantityTo: [this.queryParams?.quantityTo || ''],
      typeOfPrint: [this.queryParams?.typeOfPrint || ''],
      customer: [this.queryParams?.customer || ''],
    });

    this.setValueRange();

    if (Object.keys(this.queryParams).length) {
      this.search(false);
    }
  }

  setValueRange(): void {
    this.valueRange = {
      min: +this.form?.get('priceFrom')?.value || MIN,
      max: +this.form?.get('priceTo')?.value || MAX,
    };

    this.fillColorRange();
  }

  onClose(): void {
    this.isOpen = false;
  }

  updateValueRange(value: number, type: 'min' | 'max'): void {
    this.valueRange[type] = +onlyNumberMask(value);

    if (type === 'min' && this.valueRange.min >= this.valueRange.max) {
      this.valueRange.max = this.valueRange.min;
    } else if (type === 'max' && this.valueRange.max <= this.valueRange.min) {
      this.valueRange.min = this.valueRange.max;
    }

    this.fillColorRange();
  }

  fillColorRange(): void {
    if (!this.filterConfig.isFilterPrise) {
      return;
    }

    if (!this.sliderTrack) {
      of(null)
        .pipe(delay(300), takeUntil(this.destroy$))
        .subscribe(() => this.fillColorRange());

      return;
    }

    const minPrice = this.filterConfig.minPrice || MIN;
    const maxPrice = this.filterConfig.maxPrice || MAX;
    const percent1 =
      ((this.valueRange.min - minPrice) / (maxPrice - minPrice)) * 100;
    const percent2 =
      ((this.valueRange.max - minPrice) / (maxPrice - minPrice)) * 100;

    this.renderer.setStyle(
      this.sliderTrack.nativeElement,
      'background',
      `linear-gradient(to right, #EEF6FF ${percent1}% , #1B459B ${percent1}% , #1B459B ${percent2}%, #EEF6FF ${percent2}%)`
    );
  }

  search(isReload: boolean = true): void {
    const isSetMin = this.valueRange.min !== this.filterConfig.minPrice;
    const isSetMax = this.valueRange.max !== this.filterConfig.maxPrice;

    if (this.filterConfig.isFilterPrise) {
      this.form
        .get('priceFrom')
        ?.setValue(isSetMin || isSetMax ? this.valueRange.min : null);
      this.form
        .get('priceTo')
        ?.setValue(isSetMin || isSetMax ? this.valueRange.max : null);
    }

    if (this.filterConfig.isSizeRange) {
      this.validateRange('productSizeFrom', 'productSizeTo');
    }

    if (this.filterConfig.isQuantity) {
      this.validateRange('quantityFrom', 'quantityTo');
    }

    this.searchEvent.emit({
      data: removeEmptyFromObj(this.form.value),
      isReload,
    });

    this.onClose();
  }

  validateRange(minFieldName: string, maxFieldName: string): void {
    const minValue = this.form.get(minFieldName)?.value;
    const maxValue = this.form.get(maxFieldName)?.value;

    if (minValue && maxValue) {
      const minNewValue = +maxValue < +minValue ? maxValue : minValue;
      const maxNewValue = +minValue > +maxValue ? minValue : maxValue;

      this.form.get(minFieldName)?.setValue(minNewValue);
      this.form.get(maxFieldName)?.setValue(maxNewValue);
    }
  }

  clear(): void {
    this.valueRange = {
      min: this.filterConfig.minPrice || MIN,
      max: this.filterConfig.maxPrice || MAX,
    };
    this.fillColorRange();
    this.form.reset();
  }
}
