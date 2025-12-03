import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { AddressType } from 'src/app/core/enums/address-type.enum';
import { convertBooleanToAnswer } from 'src/app/shared/utils/convert-answer';
import { transformSelectList } from 'src/app/shared/utils/transform-select-list';
import { BaseDeliveryFormComponent } from '../base-delivery-form/base-delivery-form.component';
import { IAddressBySearch } from 'src/app/core/models/address.model';
import { debounceTime, delay, distinctUntilChanged, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { titleCase } from 'src/app/shared/utils/title-case';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-enter-address-form',
  templateUrl: './enter-address-form.component.html',
})
export class EnterAddressFormComponent extends BaseDeliveryFormComponent {
  ADDRESS_TYPE_OPTIONS = transformSelectList(AddressType);
  listOfAddress: IAddressBySearch[] = [];
  listOfAddressString: string[] = [];
  isNotFound: boolean;
  searchSubject = new Subject<string>();

  override initForm(): void {
    super.initForm();

    this.form = this.formBuilder.group({
      newAddressCompanyName: [
        this.deliveryDetails.newAddressCompanyName || '',
        Validators.required,
      ],
      contactName: [
        this.deliveryDetails.contactName || '',
        Validators.required,
      ],
      newAddressAddress1: [
        this.deliveryDetails.newAddressAddress1 || '',
        Validators.required,
      ],
      newAddressAddress2: [this.deliveryDetails.newAddressAddress2 || ''],
      newAddressSuburb: [
        this.deliveryDetails.newAddressSuburb || '',
        Validators.required,
      ],
      newAddressType: [
        this.deliveryDetails.newAddressType || titleCase(AddressType.Business),
        Validators.required,
      ],
      newAddressState: [
        this.deliveryDetails.newAddressState || '',
        Validators.required,
      ],
      newAddressPostcode: [
        this.deliveryDetails.newAddressPostcode || '',
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
      authorityToLeave: [this.deliveryDetails.authorityToLeave || ''],
      deliveryInstruction: [this.deliveryDetails.deliveryInstruction || ''],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToSearch();
  }

  changeAddressType(value: AddressType): void {
    this.form.get('type')?.patchValue(value);
  }

  subscribeToSearch(): void {
    this.searchSubject
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) =>
        this.addressService
          .searchAddressInLocation(value)
          .pipe(takeUntil(this.destroy$))
      )
    ).subscribe((data) => {
      this.isNotFound = !data.length;
      this.listOfAddress = data;
      this.listOfAddressString = data.map((d) => d.shortAddress);
      this.cdr.detectChanges();
    });
  }

  searchAddress(value: string): void {
    if (value.length < 3) {
      of(null).pipe(delay(1000)).subscribe(() => this.listOfAddressString = []);

      return;
    }

    this.searchSubject.next(value);
  }

  selectAddress(value: string): void {
    const selectedAddress = this.listOfAddress.find(
      (a) => a.shortAddress === value
    );

    if (!selectedAddress) {
      return;
    }

    this.addressService
      .getDataByAddressId(selectedAddress.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.form.get('newAddressAddress1')?.setValue(data.addressLine);
        this.cdr.detectChanges();
      });
  }
}
