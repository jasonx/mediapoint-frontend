import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { convertBooleanToAnswer } from 'src/app/shared/utils/convert-answer';
import { BaseDeliveryFormComponent } from '../base-delivery-form/base-delivery-form.component';
import { IBaseLabel } from 'src/app/core/models/base.model';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-address-from-book-form',
  templateUrl: './address-from-book-form.component.html',
})
export class AddressFromBookFormComponent extends BaseDeliveryFormComponent {
  ADDRESS_BOOK_OPTIONS: { id: number; label: string }[] = [];

  override initForm(): void {
    super.initForm();

    this.setAddressBook();

    this.form = this.formBuilder.group({
      contactName: [
        this.deliveryDetails.contactName || '',
        Validators.required,
      ],
      selectedAddressId: [
        this.selectedAddressById(this.deliveryDetails?.selectedAddressId) || '',
        Validators.required,
      ],
      dispatchEmail: [
        this.deliveryDetails.dispatchEmail || '',
        [Validators.required, strictEmailValidator()],
      ],
      dispatchEmail2: [
        this.deliveryDetails.dispatchEmail2 || '',
        strictEmailValidator(),
      ],
      addLogoToConsignmentLogo: [
        convertBooleanToAnswer(!!this.deliveryDetails.addLogoToConsignmentLogo),
        Validators.required,
      ],
      authorityToLeave: [this.deliveryDetails.authorityToLeave || ''],
      deliveryInstruction: [this.deliveryDetails.deliveryInstruction || ''],
    });
  }

  setAddressBook(): void {
    this.ADDRESS_BOOK_OPTIONS = this.deliveryDetails?.addressBookOptions || [];
  }

  selectedAddressById(id: number | undefined): IBaseLabel | undefined {
    return this.deliveryDetails.addressBookOptions?.find((a) => a.id === id);
  }
}
