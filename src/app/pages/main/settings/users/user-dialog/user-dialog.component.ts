import { Component, Inject, OnInit } from '@angular/core';
import { FieldTypes } from '../../../../../core/enums/field-type.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IButtonConfig } from '../../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../../core/enums/button-view-type.enum';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonType } from '../../../../../core/enums/button-type.enum';
import { phoneMask } from 'src/app/shared/utils/masks';
import { IUserItem, IUserType } from 'src/app/core/models/user.model';
import { SettingsService } from 'src/app/core/services/settings.service';
import { catchError, takeUntil, throwError } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { UsersService } from '../../../../../core/services/users.service';
import { removeEmptyFromObj } from '../../../../../shared/utils/remove-empty';
import { updateFormErrors } from '../../../../../shared/utils/update-form-errors';
import { matchValidator, strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.less'],
  providers: [AutoDestroyService],
})
export class UserDialogComponent implements OnInit {
  phoneMask = phoneMask;
  typeOfUser = Object.values(IUserType).splice(1);
  FIELD_TYPES = FieldTypes;
  form: FormGroup;
  userData: IUserItem | undefined;
  isEdit: boolean;
  isChangePassword: boolean;
  isLoadedBtn: boolean = true;
  buttonPasswordConfig: IButtonConfig = {
    text: 'Change password',
    type: ButtonType.Button,
    viewType: ButtonViewType.Link,
  };
  buttonCancelConfig: IButtonConfig = {
    text: 'Cancel',
    type: ButtonType.Button,
    viewType: ButtonViewType.LightBlue,
    padding: '0px',
    minWidth: '174px',
  };
  buttonSubmitConfig: IButtonConfig = {
    text: 'Save',
    type: ButtonType.Submit,
    viewType: ButtonViewType.Filled,
    padding: '0px',
    minWidth: '174px',
  };

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private settingsService: SettingsService,
    private userService: UsersService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      userData: IUserItem | undefined;
      isCustomersPage?: boolean;
    },
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.userData = this.data?.userData;
    this.isEdit = !!this.userData;
    this.initForm();
  }

  initForm(): void {
    if (this.isEdit) {
      if (this.isChangePassword) {
        this.form = this.formBuilder.nonNullable.group({
          firstName: [this.userData?.firstName, [Validators.required]],
          lastName: [this.userData?.lastName, [Validators.required]],
          phone: [this.userData?.phone, [Validators.required]],
          email: [
            this.userData?.email,
            [Validators.required, strictEmailValidator()],
          ],
          secondaryEmail: [this.userData?.secondaryEmail, [strictEmailValidator()]],
          typeUser: [this.userData?.typeUser, [Validators.required]],
          password: ['', [Validators.required, Validators.minLength(8)]],
          passwordConfirmation: [
            '',
            [Validators.required, Validators.minLength(8)],
          ],
        });
      } else {
        this.form = this.formBuilder.nonNullable.group({
          firstName: [this.userData?.firstName, [Validators.required]],
          lastName: [this.userData?.lastName, [Validators.required]],
          phone: [this.userData?.phone, [Validators.required]],
          email: [
            this.userData?.email,
            [Validators.required, strictEmailValidator()],
          ],
          secondaryEmail: [this.userData?.secondaryEmail, [strictEmailValidator()]],
          typeUser: [this.userData?.typeUser, [Validators.required]],
        });
      }
    } else {
      this.form = this.formBuilder.nonNullable.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required, strictEmailValidator()]],
        secondaryEmail: ['', [strictEmailValidator()]],
        typeUser: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
      });
    }
  }

  submitForm(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isLoadedBtn = false;
    const value = this.isEdit
      ? {
          ...this.form.value,
          id: this.userData?.id,
        }
      : this.form.value;

    if (this.data?.isCustomersPage) {
      this.settingsService
        .saveEmployee(removeEmptyFromObj(value), this.data?.isCustomersPage)
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
          this.dialogRef.close(DialogActionEnum.Accept);
        });
    } else {
      this.userService
        .saveUser(value, this.isEdit)
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
          this.dialogRef.close(DialogActionEnum.Accept);
        });
    }
  }

  changePassword(): void {
    this.isChangePassword = true;
    this.initForm();
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

  cancel(): void {
    this.dialogRef.close(DialogActionEnum.Close);
  }
}
