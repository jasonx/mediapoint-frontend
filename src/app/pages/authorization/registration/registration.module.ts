import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { CustomerInformationComponent } from './customer-information/customer-information.component';
import { SharedModule } from '../../../shared/shared.module';
import { REGISTRATION } from '../../../core/constants/registration.constant';

const routes: Routes = [
  {
    path: '',
    component: RegistrationComponent,
    children: [
      {
        path: '',
        redirectTo: REGISTRATION.PERSONAL_INFORMATION,
        pathMatch: 'full',
      },
      {
        path: REGISTRATION.PERSONAL_INFORMATION,
        component: PersonalInformationComponent,
      },
      {
        path: REGISTRATION.CUSTOMER_INFORMATION,
        component: CustomerInformationComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [PersonalInformationComponent, CustomerInformationComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class RegistrationModule {}
