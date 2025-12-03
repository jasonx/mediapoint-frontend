import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { DeliverySettingsComponent } from './delivery-settings/delivery-settings.component';
import { UsersComponent } from './users/users.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        redirectTo: 'personal-information',
        pathMatch: 'full',
      },
      {
        path: 'personal-information',
        component: PersonalInformationComponent,
      },
      {
        path: 'company-details',
        component: CompanyDetailsComponent,
      },
      {
        path: 'delivery-settings',
        component: DeliverySettingsComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRouting {}
