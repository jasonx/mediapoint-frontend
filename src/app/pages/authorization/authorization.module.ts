import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthorizationBaseComponent } from './authorization-base/authorization-base.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { AUTHORIZATION } from '../../core/constants/authorization.constant';
import { register } from 'swiper/element/bundle';
register();

const routes: Routes = [
  {
    path: '',
    component: AuthorizationBaseComponent,
    children: [
      {
        path: '',
        redirectTo: AUTHORIZATION.LOGIN,
        pathMatch: 'full',
      },
      {
        path: AUTHORIZATION.LOGIN,
        component: LoginComponent,
      },
      {
        path: AUTHORIZATION.CONFIRM_EMAIL_UPDATING,
        component: LoginComponent,
      },
      {
        path: AUTHORIZATION.REGISTRATION,
        loadChildren: () =>
          import('./registration/registration.module').then(
            (m) => m.RegistrationModule
          ),
      },
      {
        path: AUTHORIZATION.FORGOT_PASSWORD,
        component: ForgotPasswordComponent,
      },
      {
        path: AUTHORIZATION.RESET_PASSWORD,
        component: ResetPasswordComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    LoginComponent,
    AuthorizationBaseComponent,
    ForgotPasswordComponent,
    RegistrationComponent,
    ResetPasswordComponent,
    DialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthorizationModule {}
