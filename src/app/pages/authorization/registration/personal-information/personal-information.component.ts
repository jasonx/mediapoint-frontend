import { Component, OnInit } from '@angular/core';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { Router } from '@angular/router';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { catchError, takeUntil } from 'rxjs';
import { RegistrationService } from '../../../../core/services/registration.service';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import { autoSave, field } from '../../../../shared/decorators/auto-save';
import { IPersonalInformation } from '../../../../core/models/personal-information.model';
import { LocalStorageRegistrationKey } from '../../../../core/enums/local-storage-key.enum';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { AUTHORIZATION } from 'src/app/core/constants/authorization.constant';
import { AccountUsageDataType } from 'src/app/core/enums/account-usage-type.enum';
import { phoneMask } from 'src/app/shared/utils/masks';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { DIALOG_ICON } from 'src/app/core/constants/dialog-icon.constant';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.less'],
  providers: [AutoDestroyService],
})
export class PersonalInformationComponent implements OnInit {
  AUTHORIZATION = AUTHORIZATION;
  FIELD_TYPES = FieldTypes;
  ACCOUNT_TYPE = AccountUsageDataType;
  phoneMask = phoneMask;
  isLoadedBtn: boolean = true;
  form: FormGroup;
  errorNotification = '';

  buttonSubmitConfig: IButtonConfig = {
    text: 'Unlock Trade Pricing',
    type: ButtonType.Submit,
    viewType: ButtonViewType.FilledRed,
    padding: '0 50px',
    minWidth: '100%',
  };
  buttonSignInConfig: IButtonConfig = {
    text: 'Sign in',
    viewType: ButtonViewType.Text,
    padding: '0 8px',
  };

  dialogConfig: IDialogConfig = {
    icon: DIALOG_ICON.EMAIL,
    title: 'Thank you for registering',
    message:
      'After confirmation by the administrator, your account will be available. We will send you a notification by email',
    informationButtonText: 'Go to login',
  };

  @autoSave(LocalStorageRegistrationKey.PersonalInformation)
  formStorage: FormGroup =
    this.formBuilder.nonNullable.group<IPersonalInformation>({
      firstName: '',
      email: '',
      password: '',
      phone: '',
      abn: '',
      type: null,
    });

  constructor(
    public router: Router,
    public destroy$: AutoDestroyService,
    public formBuilder: FormBuilder,
    public registrationService: RegistrationService,
    public authService: AuthorizationService,
    public dialog: MatDialog,
    public platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscribeForm();
  }

  initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      firstName: [field(this.formStorage, 'firstName'), Validators.required],
      email: [
        field(this.formStorage, 'email'),
        [Validators.required, strictEmailValidator()],
      ],
      password: [field(this.formStorage, 'password'), Validators.required],
      phone: [field(this.formStorage, 'phone'), Validators.required],
      abn: [field(this.formStorage, 'abn'), Validators.required],
      type: [field(this.formStorage, 'type'), Validators.required],
    });
  }

  subscribeForm(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IPersonalInformation) => {
        this.formStorage.patchValue(data);
      });
  }

  selectType(type: AccountUsageDataType): void {
    if (type === AccountUsageDataType.Business) {
      this.buttonSubmitConfig.isDisabled = true;
      this.errorNotification = 'We only deal with resellers of print';
    } else {
      this.buttonSubmitConfig.isDisabled = false;
      this.errorNotification = '';
    }

    this.form.get('type')?.setValue(type);
  }

  submitForm(): void {
    if (!this.form.get('type')?.value) {
      this.errorNotification = 'Select one of the options.';
    }

    if (this.isInvalidData) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.registrationService
      .personalInformation(<IPersonalInformation>this.form.value)
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
          this.router
            .navigate([
              this.authService.fromPageUrl
                ? this.authService.fromPageUrl
                : './authorization/login',
            ])
            .then(() => {
              if (this.authService.fromPageUrl) {
                this.authService.fromPageUrl = null;
              }
            });
        }
      });
  }

  getIsSelectedType(type: AccountUsageDataType): boolean {
    return field(this.formStorage, 'type') === type;
  }

  get isInvalidData(): boolean {
    return (
      this.form.invalid || this.getIsSelectedType(AccountUsageDataType.Business)
    );
  }
}
