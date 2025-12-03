import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { IBaseTitle } from 'src/app/core/models/base.model';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { delay, of } from 'rxjs';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FieldComponent),
  multi: true,
};

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.less'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class FieldComponent implements ControlValueAccessor {
  FIELD_TYPES = FieldTypes;
  isShowPassword: boolean;
  isSelectorOpen: boolean;
  isFocus: boolean;
  private innerValue: any = '';

  @Input() control: AbstractControl;
  @Input() label: string = '';
  @Input() labelColor: string = '#111729';
  @Input() type: FieldTypes = FieldTypes.Text;
  @Input() name: string;
  @Input() placeholder: string = '';
  @Input() radioValue: any;
  @Input() selectedRadioInputValue: IBaseTitle;
  @Input() tooltipText: string = '';
  @Input() isDisabled: boolean;
  @Input() options: any[] = [];
  @Input() noOptionsText: string;
  @Input() isNotFound: boolean;
  @Input() mask: ((value: string) => string) | null;
  @Input() dimension: string;
  @Input() searchUrl: string;
  @Input() isAutocomplete: boolean = true;
  @Input() set setInputValue(value: any) {
    this.value = !!this.mask && value ? this.mask(value) : value;
  }
  @Input() set setOptionsBySearch(options: any[]) {
    this.options = options;
  }

  @Output() inputEvent = new EventEmitter();
  @Output() selectedEvent = new EventEmitter();
  @Output() blurEvent = new EventEmitter();

  @ViewChild('input') inputRef: ElementRef;

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
    }
  }

  get isRadioInputChecked(): boolean {
    return this.selectedRadioInputValue.id === this.radioValue.id;
  }

  get isError(): boolean {
    return this.control?.invalid && this.control?.touched;
  }

  setValidators(): void {
    if (!this.control) {
      return;
    }

    this.control.setValidators(
      this.control.validator ? this.control.validator : []
    );
  }

  onChange(value: any) {
    this.innerValue = isNaN(this.innerValue) ? value.trim() : value;

    this.propagateChange(this.innerValue);
    this.control?.markAsTouched();
    this.blurEvent.emit(this.value);
  }

  onChangeDisplayPass(): void {
    this.isShowPassword = !this.isShowPassword;
    this.inputRef.nativeElement.setAttribute(
      'type',
      this.isShowPassword ? FieldTypes.Text : FieldTypes.Password
    );
  }

  onFocus(): void {
    this.isFocus = true;
    this.control?.markAsUntouched();
  }

  getIsSelected(option: any): boolean {
    return this.value?.id?.toString()
      ? this.value.id === option.id
      : Array.isArray(this.value)
      ? this.value.find((v: any) => v.id === option.id)
      : this.value && this.value === option;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  propagateChange = (_: any) => {};

  writeValue(value: any) {
    this.value = !!this.mask && value ? this.mask(value) : value;
    this.propagateChange(this.value);
    this.inputEvent.emit(this.value);
  }

  writeRadioValue(title: string): void {
    title = this.mask ? this.mask(title) : title;
    this.selectedRadioInputValue = { id: this.radioValue.id, title };
    this.radioValue.title = title;

    this.propagateChange(this.selectedRadioInputValue);
    this.inputEvent.emit(this.selectedRadioInputValue);
  }

  onSelected(value: string): void {
    this.value = !!this.mask && value ? this.mask(value) : value;
    this.propagateChange(this.value);
    this.selectedEvent.emit(value);
    this.control?.markAsTouched();
    this.onClickedOutside();
  }

  onClickedOutside() {
    of(null).pipe(delay(300)).subscribe(() => {
      this.isSelectorOpen = false;
      this.isFocus = false;
    })
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
    this.setValidators();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerOnTouched(fn: any) {}

  get errorText(): string {
    return this.control?.errors ? this.control.errors['errorText'] : '';
  }

  get isRequired(): boolean {
    return this.control?.validator
      ? this.control.validator({} as AbstractControl)?.['required']
      : false;
  }
}
