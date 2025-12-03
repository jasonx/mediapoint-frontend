import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { RegistrationService } from '../../../../core/services/registration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { ICustomerInformation } from '../../../../core/models/customer-information.model';
import { phoneMask } from 'src/app/shared/utils/masks';

import { catchError, debounceTime, take, takeUntil } from 'rxjs';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import { autoSave, field } from '../../../../shared/decorators/auto-save';
import { LocalStorageRegistrationKey } from '../../../../core/enums/local-storage-key.enum';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { IAddressBySearch } from 'src/app/core/models/address.model';
import { AddressService } from 'src/app/core/services/address.service';
import { AccountUsageDataType } from 'src/app/core/enums/account-usage-type.enum';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { DIALOG_ICON } from 'src/app/core/constants/dialog-icon.constant';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { strictEmailValidator, urlValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.less'],
  providers: [AutoDestroyService],
})
export class CustomerInformationComponent implements OnInit {
  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  phoneMask = phoneMask;
  isLoadedBtn: boolean = true;
  listOfAddtess: IAddressBySearch[] = [];
  listOfAddtessString: string[] = [];
  isNotFound: boolean;

  buttonSubmitConfig: IButtonConfig = {
    text: 'Finish registration',
    type: ButtonType.Submit,
    viewType: ButtonViewType.TransparentWhite,
    padding: '0 50px',
    minWidth: '100%',
  };

  dialogConfig: IDialogConfig = {
    icon: DIALOG_ICON.EMAIL,
    title: 'Thank you for registering',
    informationButtonText: 'Go to login',
  };

  @autoSave(LocalStorageRegistrationKey.CustomerInformation)
  formStorage: FormGroup =
    this.formBuilder.nonNullable.group<ICustomerInformation>({
      registrationRequestToken: '',
      type: AccountUsageDataType.Resell,
      firstName: '',
      lastName: '',
      companyName: '',
      address1: '',
      address2: '',
      suburb: '',
      state: '',
      postcode: '',
      phone: '',
      website: '',
      email: '',
      abn: '',
    });

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private destroy$: AutoDestroyService,
    private formBuilder: FormBuilder,
    private registrationService: RegistrationService,
    private addressService: AddressService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscribeForm();
    this.getQueryParams();
  }

  getQueryParams(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const preFilledData = {
          registrationRequestToken: params['registration_request_token'],
          firstName: params['first_name'],
          abn: params['abn'],
        };

        this.form.patchValue(preFilledData);

        this.verifyEmail(
          params['email_request_id'],
          params['registration_request_token']
        );
      });
  }

  verifyEmail(requestId: string, token: string): void {
    this.registrationService
      .verifyEmail(true, requestId, token)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.router.navigate(['/authorization/registration']).then();

          throw err;
        })
      )
      .subscribe();
  }

  initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      registrationRequestToken: [
        field(this.formStorage, 'registrationRequestToken'),
        Validators.required,
      ],
      type: [field(this.formStorage, 'type'), Validators.required],
      firstName: [field(this.formStorage, 'firstName'), Validators.required],
      lastName: [field(this.formStorage, 'lastName'), Validators.required],
      companyName: [
        field(this.formStorage, 'companyName'),
        Validators.required,
      ],
      address1: [field(this.formStorage, 'address1'), Validators.required],
      address2: [field(this.formStorage, 'address2')],
      suburb: [field(this.formStorage, 'suburb'), Validators.required],
      state: [field(this.formStorage, 'state'), Validators.required],
      postcode: [field(this.formStorage, 'postcode'), Validators.required],
      phone: [field(this.formStorage, 'phone'), Validators.required],
      website: [
        field(this.formStorage, 'website'),
        [Validators.required, urlValidator],
      ],
      email: [
        field(this.formStorage, 'email'),
        [Validators.required, strictEmailValidator()],
      ],
      abn: [field(this.formStorage, 'abn'), Validators.required],
    });
  }

  subscribeForm(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ICustomerInformation) => {
        this.formStorage.patchValue(data);
      });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.registrationService
      .customerInformation(this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;
          updateFormErrors(this.form, err);

          throw err;
        })
      )
      .subscribe(() => {
        this.isLoadedBtn = true;
        this.openThankDialog();
      });
  }

  openThankDialog(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Close) {
          this.router.navigate(['./authorization/login']).then();
        }
      });
  }

  searchAddress(value: string): void {
    if (value.length < 3) {
      this.listOfAddtessString = [];

      return;
    }

    this.addressService
      .searchAddress(value)
      .pipe(debounceTime(300), take(1), takeUntil(this.destroy$))
      .subscribe((data) => {
        this.isNotFound = !data.length;
        this.listOfAddtess = data;
        this.listOfAddtessString = data.map((d) => d.shortAddress);
        this.cdr.detectChanges();
      });
  }

  selectAddress(value: string): void {
    const selectedAddress = this.listOfAddtess.find(
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
}
