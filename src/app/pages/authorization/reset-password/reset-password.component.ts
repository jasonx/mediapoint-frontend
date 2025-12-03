import { Component, OnInit } from '@angular/core';
import { catchError, takeUntil } from 'rxjs';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldTypes } from '../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../core/models/button-config.model';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { IDialogConfig } from '../../../core/models/dialog-config.model';
import { DIALOG_ICON } from '../../../core/constants/dialog-icon.constant';
import { ButtonType } from '../../../core/enums/button-type.enum';
import { updateFormErrors } from '../../../shared/utils/update-form-errors';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.less'],
})
export class ResetPasswordComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  form: FormGroup;
  isLoadedBtn: boolean = true;
  buttonSubmitConfig: IButtonConfig = {
    text: 'Reset password',
    type: ButtonType.Submit,
    viewType: ButtonViewType.TransparentWhite,
    padding: '0 50px',
    minWidth: '100%',
  };

  dialogConfig: IDialogConfig = {
    icon: DIALOG_ICON.LOCK,
    title: 'Your password has been reset!',
    informationButtonText: 'Go to login',
  };

  constructor(
    private authService: AuthorizationService,
    private destroy$: AutoDestroyService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    if (
      this.form.controls['password'].value !==
      this.form.controls['passwordConfirmation'].value
    ) {
      this.form.controls['passwordConfirmation'].setErrors({
        errorText: 'The password confirmation does not match',
      });

      return;
    }

    this.isLoadedBtn = false;
    this.authService
      .resetPassword(this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;

          if (err.error.errors) {
            updateFormErrors(this.form, err);
          }

          throw err;
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
      data: this.dialogConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.router.navigate(['./authorization/login']).then());
  }

  private initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      email: this.route.snapshot.queryParams['email'],
      token: this.route.snapshot.queryParams['token'],
      password: ['', [Validators.required]],
      passwordConfirmation: ['', [Validators.required]],
    });
  }
}
