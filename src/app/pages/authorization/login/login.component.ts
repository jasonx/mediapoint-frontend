import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { FieldTypes } from '../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../core/models/button-config.model';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { catchError, take, takeUntil } from 'rxjs';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { ButtonType } from '../../../core/enums/button-type.enum';
import {
  autoSave,
  autoSaveClear,
  field,
} from '../../../shared/decorators/auto-save';
import { ILogin } from '../../../core/models/login-form.model';
import { updateFormErrors } from '../../../shared/utils/update-form-errors';
import {
  companyDeleted,
  credentialsDoNotMatch,
  notConfirmedProfile,
} from '../../../core/interceptors/error.interceptor';
import { AUTHORIZATION } from 'src/app/core/constants/authorization.constant';
import { RegistrationService } from 'src/app/core/services/registration.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { DIALOG_ICON } from 'src/app/core/constants/dialog-icon.constant';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

const key = 'login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [AutoDestroyService],
})
export class LoginComponent implements OnInit {
  AUTHORIZATION = AUTHORIZATION;

  form: FormGroup;
  notification: string | null = null;
  FIELD_TYPES = FieldTypes;
  isLoadedBtn: boolean = true;
  isShowPassword: boolean;
  isLoginPage: boolean;
  buttonSubmitConfig: IButtonConfig = {
    text: 'Login',
    type: ButtonType.Submit,
    viewType: ButtonViewType.FilledRed,
    padding: '0 50px',
    minWidth: '100%',
  };
  buttonSignUpConfig: IButtonConfig = {
    text: 'Sign up',
    viewType: ButtonViewType.Text,
    padding: '0 8px',
  };
  buttonRecoveryConfig: IButtonConfig = {
    text: 'Forgot password?',
    viewType: ButtonViewType.Link,
    color: 'white',
    padding: '2px 0',
  };
  dialogConfig: IDialogConfig = {
    icon: DIALOG_ICON.EMAIL,
    title: 'Success!',
    informationButtonText: 'Go to login',
  };

  @autoSave(key)
  formStorage: FormGroup = this.formBuilder.nonNullable.group({
    email: '',
    password: '',
  });

  constructor(
    private authService: AuthorizationService,
    private registrationService: RegistrationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscribeForm();
    this.trackVerifyEmail();
  }

  trackVerifyEmail(): void {
    this.activatedRoute.queryParams
      .pipe(
        takeUntil(this.destroy$),
        take(1)
      )
      .subscribe((params) => {
        const requestId = params['request_id'];
        const { token } = params;

        if (requestId && token) {
          this.isLoginPage = this.router.url.includes(AUTHORIZATION.LOGIN);

          this.registrationService
            .verifyEmail(this.isLoginPage, requestId, token)
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                throw err;
              })
            )
            .subscribe(() => {
              if (!this.isLoginPage) {
                this.router.navigate(['./authorization/login']).then();
              }

              this.openSuccessDialog()
            });
        }
      });
  }

  openSuccessDialog(): void {
    let dialogConfig = new MatDialogConfig();

    this.dialogConfig.message = this.isLoginPage
      ? 'Your email has been verified.'
      : 'Email was successfully confirmed.';

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogConfig,
    };

    this.dialog.open(DialogComponent, dialogConfig);
  }

  initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      email: [
        field(this.formStorage, 'email'),
        [Validators.required, strictEmailValidator()],
      ],
      password: [field(this.formStorage, 'password'), [Validators.required]],
    });
  }

  subscribeForm(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ILogin) => {
        this.formStorage.patchValue(data);

        if (
          this.form
            .get('email')
            ?.errors?.['errorText']?.includes(
              'These credentials do not match our records.'
            )
        ) {
          this.form.controls['email'].setErrors(null);
        }
      });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.authService
      .login(<ILogin>this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;

          if (err.error.message === credentialsDoNotMatch) {
            this.notification = null;
            updateFormErrors(this.form, err);
          } else {
            switch (err.error.message) {
              case notConfirmedProfile:
                this.notification =
                  'This email address has not yet been approved by Mediapoint Administrator. <br/> Please try again later';
                break;
              case companyDeleted:
                this.notification =
                  'The company you are associated with is no longer active in our system. Please email <a href = "mailto:trade@mediapoint.com.au">trade@mediapoint.com.au</a> to get your account active again.';
                break;
              default:
                this.notification = err.error.message;
            }
          }

          throw err;
        })
      )
      .subscribe((response) => {
        this.isLoadedBtn = true;

        if (response.accessToken) {
          this.router
            .navigate([
              this.authService.fromPageUrl
                ? this.authService.fromPageUrl
                : '/dashboard',
            ])
            .then(() => {
              autoSaveClear(key);

              if (this.authService.fromPageUrl) {
                this.authService.fromPageUrl = null;
              }
            });
        }
      });
  }

  onChangeDisplayPass(): void {
    this.isShowPassword = !this.isShowPassword;
  }
}
