import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { AnswerYesNo } from 'src/app/core/enums/answer-yes-no.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IDeliveryDetails } from 'src/app/core/models/delivery-details.model';
import { AddressService } from 'src/app/core/services/address.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { convertAnswerToBoolean } from 'src/app/shared/utils/convert-answer';
import { phoneMask } from 'src/app/shared/utils/masks';
import { removeEmptyFromObj } from 'src/app/shared/utils/remove-empty';

@Component({
  selector: 'app-base-delivery-form',
  template: '',
})
export class BaseDeliveryFormComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  phoneMask = phoneMask;
  form: FormGroup;
  AVAILABLE_DISPATCH_EMAIL: string[] = [];
  addLogoOptions = [AnswerYesNo.Yes, AnswerYesNo.No];

  @Input() deliveryDetails: IDeliveryDetails;
  @Output() fillFormEvent: EventEmitter<{
    data: IDeliveryDetails;
    isValid: boolean;
  }> = new EventEmitter();

  constructor(
    public formBuilder: FormBuilder,
    public addressService: AddressService,
    public destroy$: AutoDestroyService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setDispatchEmail();
    this.subscribeToFormChanges();
  }

  initForm(): void {}

  setDispatchEmail(): void {
    if (this.deliveryDetails.availableDispatchEmail) {
      this.AVAILABLE_DISPATCH_EMAIL = Object.values(
        this.deliveryDetails.availableDispatchEmail
      );
    }
  }

  subscribeToFormChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: IDeliveryDetails) => {
        this.emitFormData(value);
      });

    this.emitFormData();
  }

  emitFormData(value?: IDeliveryDetails): void {
    const formData = value ? value : this.form.value;

    this.fillFormEvent.emit({
      data: this.formattedData(formData),
      isValid: this.form.valid,
    });
  }

  formattedData(value: IDeliveryDetails): IDeliveryDetails {
    let formattedValue = Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        typeof v === 'object' && v.id.toString() ? v.id : v,
      ])
    );

    if (value.addLogoToConsignmentLogo !== undefined) {
      formattedValue['addLogoToConsignmentLogo'] = convertAnswerToBoolean(
        value.addLogoToConsignmentLogo as AnswerYesNo
      );
    }

    return removeEmptyFromObj(formattedValue);
  }
}
