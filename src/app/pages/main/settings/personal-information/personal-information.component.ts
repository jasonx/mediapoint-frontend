import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import { SettingsService } from '../../../../core/services/settings.service';
import { catchError, takeUntil, throwError } from 'rxjs';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { ISettingsPersonalInformation } from '../../../../core/models/personal-information.model';
import { IDialogConfig } from '../../../../core/models/dialog-config.model';
import { DIALOG_ICON } from '../../../../core/constants/dialog-icon.constant';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { matchValidator, strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.less'],
})
export class PersonalInformationComponent implements OnInit {
  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  isLoadedBtn: boolean = true;
  isDataLoaded: boolean;
  personalInitialValue: any;
  buttonSubmitConfig: IButtonConfig = {
    text: 'Save',
    type: ButtonType.Submit,
    viewType: ButtonViewType.Filled,
    minWidth: '174px',
  };
  buttonCancelConfig: IButtonConfig = {
    text: 'Cancel',
    type: ButtonType.Button,
    viewType: ButtonViewType.TransparentBlue,
    minWidth: '174px',
  };
  personalInformation: ISettingsPersonalInformation;
  changeContactEmailDialogConfig: IDialogConfig = {
    icon: DIALOG_ICON.EMAIL,
    title: 'Your contact email has been reset',
    message: 'We have sent a link to reset the contact email to your email',
    informationButtonText: 'Logout',
  };
  dialogSuccessConfig: IDialogConfig = {
    title: 'Success!',
    isSuccess: true,
  };

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    public destroy$: AutoDestroyService,
    private authService: AuthorizationService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.settingsService
      .getPersonalSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.personalInformation = data;
        this.initForm(this.personalInformation);
        this.isDataLoaded = true;
      });
  }

  initForm(data: ISettingsPersonalInformation) {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.nonNullable.group({
      firstName: [data.firstName, [Validators.required]],
      lastName: [data.lastName, [Validators.required]],
      contactEmail: [
        data.contactEmail,
        [Validators.required, strictEmailValidator()],
      ],
      additionalContactEmail: [data.additionalContactEmail, strictEmailValidator()],
      password: ['', [Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.minLength(8)]],
    });

    this.personalInitialValue = this.form.value;
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;

    if (this.form.get('password')?.value) {
      this.authService
        .resetPassword(this.form.value, true)
        .pipe(
          takeUntil(this.destroy$),

          catchError((err) => {
            updateFormErrors(this.form, err);
            this.isLoadedBtn = true;

            return throwError(() => new Error(err));
          })
        )
        .subscribe();
    }

    this.settingsService
      .postPersonalSettings(this.form.value)
      .pipe(
        takeUntil(this.destroy$),

        catchError((err) => {
          updateFormErrors(this.form, err);
          this.isLoadedBtn = true;

          return throwError(() => new Error(err));
        })
      )
      .subscribe(() => {
        this.isLoadedBtn = true;

        if (
          this.form.controls['contactEmail'].value !==
          this.personalInformation.contactEmail
        ) {
          this.openChangeContactEmailDialog();

          return;
        }

        this.getData();
        this.openSuccessDialog();
        this.authService.userData$.next(this.form.value);
        this.personalInitialValue = this.form.value;
      });
  }

  openChangeContactEmailDialog(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.changeContactEmailDialogConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.authService.logout());
  }

  openSuccessDialog(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogSuccessConfig,
    };

    this.dialog.open(DialogComponent, dialogConfig);
  }

  cancel(): void {
    this.form.setValue({
      ...this.personalInitialValue,
      password: '',
      passwordConfirmation: '',
    });
    this.form.markAsUntouched();
  }

  addNewPass(): void {
    const password = this.form.get('password')?.value;

    this.form
      .get('passwordConfirmation')
      ?.setValidators([
        Validators.minLength(8),
        password ? Validators.required : () => null,
        matchValidator(password, 'The password confirmation does not match'),
      ]);

    this.form.controls['passwordConfirmation'].updateValueAndValidity();
  }
}
