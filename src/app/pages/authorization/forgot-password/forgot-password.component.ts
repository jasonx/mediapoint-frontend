import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldTypes } from '../../../core/enums/field-type.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IButtonConfig } from '../../../core/models/button-config.model';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { catchError, takeUntil, throwError } from 'rxjs';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IDialogConfig } from '../../../core/models/dialog-config.model';
import { DIALOG_ICON } from '../../../core/constants/dialog-icon.constant';
import { Router } from '@angular/router';
import { ButtonType } from '../../../core/enums/button-type.enum';
import { AUTHORIZATION } from 'src/app/core/constants/authorization.constant';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ForgotPasswordComponent implements OnInit {
  AUTHORIZATION = AUTHORIZATION;
  FIELD_TYPES = FieldTypes;
  form: FormGroup;
  isLoadedBtn: boolean = true;

  buttonResetConfig: IButtonConfig = {
    text: 'Reset password',
    type: ButtonType.Submit,
    viewType: ButtonViewType.TransparentWhite,
    padding: '0 50px',
    minWidth: '100%',
  };
  buttonQuestionConfig: IButtonConfig = {
    text: 'I remember my password',
    viewType: ButtonViewType.Text,
    color: 'white',
    padding: '2px 0',
  };

  dialogConfig: IDialogConfig = {
    icon: DIALOG_ICON.LOCK,
    title: 'Email has been sent',
    message: 'We have sent you reset password link to your email: ',
    informationButtonText: 'Back to log in',
  };

  constructor(
    private authService: AuthorizationService,
    private destroy$: AutoDestroyService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, strictEmailValidator()]],
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.authService
      .forgotPassword(this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;
          this.form.controls['email'].setErrors({
            errorText: err.error.message,
          });

          return throwError(() => new Error(err));
        })
      )
      .subscribe(() => {
        this.isLoadedBtn = true;
        this.openDialog();
      });
  }

  openDialog(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: {
        ...this.dialogConfig,
        message: this.dialogConfig.message + this.form.get('email')?.value,
      },
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.router.navigate(['./authorization/login']).then());
  }
}
