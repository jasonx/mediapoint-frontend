import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsRouting } from './settings.routing';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { DeliverySettingsComponent } from './delivery-settings/delivery-settings.component';
import { UsersComponent } from './users/users.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SharedModule } from '../../../shared/shared.module';
import { UserDialogComponent } from './users/user-dialog/user-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    SettingsComponent,
    PersonalInformationComponent,
    CompanyDetailsComponent,
    DeliverySettingsComponent,
    UsersComponent,
    NotificationsComponent,
    UserDialogComponent,
  ],
  imports: [
    CommonModule,
    SettingsRouting,
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  exports: [NotificationsComponent, CompanyDetailsComponent],
})
export class SettingsModule {}
