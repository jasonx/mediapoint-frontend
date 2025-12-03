import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { phoneMask } from 'src/app/shared/utils/masks';
import { AddressService } from '../../../../core/services/address.service';
import { catchError, debounceTime, delay, distinctUntilChanged, of, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { AddressType } from '../../../../core/enums/address-type.enum';
import {
  IAddress,
  IAddressBySearch,
} from '../../../../core/models/address.model';
import { DialogActionEnum } from '../../../../core/enums/dialog-action.enum';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { transformSelectList } from 'src/app/shared/utils/transform-select-list';
import { capitalizeFirstLetter } from 'src/app/shared/utils/capitalize-first-letter';
import { HotToastService } from '@ngneat/hot-toast';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.less'],
  providers: [AutoDestroyService],
})
export class AddressDialogComponent implements OnInit {
  address: IAddress;
  isEdit: boolean;
  isLoadedBtn: boolean = true;
  Action = DialogActionEnum;
  FIELD_TYPES = FieldTypes;
  ADDRESS_TYPES = transformSelectList(AddressType);
  phoneMask = phoneMask;
  form: FormGroup;
  listOfAddress: IAddressBySearch[] = [];
  listOfAddressString: string[] = [];
  searchSubject = new Subject<string>();
  isNotFound: boolean;

  buttonSubmitConfig: IButtonConfig = {
    text: 'Save',
    type: ButtonType.Submit,
    viewType: ButtonViewType.Filled,
    minWidth: '100%',
  };
  buttonCancelConfig: IButtonConfig = {
    text: 'Cancel',
    type: ButtonType.Button,
    viewType: ButtonViewType.TransparentBlue,
    minWidth: '100%',
  };

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddressDialogComponent>,
    private addressService: AddressService,
    private destroy$: AutoDestroyService,
    private toast: HotToastService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      addressData: IAddress;
      isCustomersPage?: boolean;
    }
  ) {}

  ngOnInit(): void {
    this.address = this.data?.addressData;
    this.initForm();
    this.subscribeToSearch();
  }

  action(action: DialogActionEnum): void {
    this.dialogRef.close(action);
  }

  private initForm(): void {
    this.isEdit = !!this.address;

    this.form = this.formBuilder.nonNullable.group({
      id: this.address?.id || '',
      companyName: [
        this.address?.companyName || '',
        [Validators.required, Validators.minLength(3)],
      ],
      contactName: [
        this.address?.contactName || '',
        [Validators.required, Validators.minLength(3)],
      ],
      phone: [this.address?.phone || '', [Validators.required]],
      dispatchEmail: [
        this.address?.dispatchEmail || '',
        [Validators.required, strictEmailValidator()],
      ],
      dispatchEmail2: [this.address?.dispatchEmail2 || ''],
      address1: [
        this.address?.address1 || '',
        [Validators.required, Validators.minLength(3)],
      ],
      address2: [this.address?.address2 || ''],
      state: [this.address?.state || '', Validators.required],
      postcode: [this.address?.postcode || '', Validators.required],
      suburb: [this.address?.suburb || '', Validators.required],
      type: [capitalizeFirstLetter(this.address?.type), Validators.required],
    });
  }

  subscribeToSearch(): void {
    this.searchSubject
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) =>
        this.addressService.searchAddress(value).pipe(
          takeUntil(this.destroy$)
        )
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
        this.form.setValue({
          ...this.form.value,
          address1: data.addressLine,
          postcode: data.postcode,
          state: data.state,
          suburb: data.suburb,
        });

        this.cdr.detectChanges();
      });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.form.value.type = this.form.value.type.toLowerCase();
    this.addressService
      .saveAddress(this.isEdit, this.form.value, this.data?.isCustomersPage)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;

          updateFormErrors(this.form, err);

          return throwError(() => new Error(err));
        })
      )
      .subscribe(() => {
        this.isLoadedBtn = true;
        this.action(this.Action.Accept);
        this.showSuccessToast();
      });
  }

  showSuccessToast(message: string = 'Success!'): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        color: '#168952',
      },
    });
  }
}
