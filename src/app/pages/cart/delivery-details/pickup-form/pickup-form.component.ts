import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseDeliveryFormComponent } from '../base-delivery-form/base-delivery-form.component';
import { convertBooleanToAnswer } from 'src/app/shared/utils/convert-answer';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-pickup-form',
  templateUrl: './pickup-form.component.html',
})
export class PickupFormComponent extends BaseDeliveryFormComponent {
  override initForm(): void {
    super.initForm();

    this.form = this.formBuilder.group({
      contactName: [
        this.deliveryDetails.contactName || '',
        Validators.required,
      ],
      phone: [this.deliveryDetails.phone || '', [Validators.required]],
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
    });
  }
}
