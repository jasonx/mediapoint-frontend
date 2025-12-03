import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomersRouting } from './customers.routing';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { CompanyComponent } from './company/company.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CompanyAddressesComponent } from './company/company-addresses/company-addresses.component';
import { CompanyEmployeesComponent } from './company/company-employees/company-employees.component';
import { CompanyOrdersComponent } from './company/company-orders/company-orders.component';
import { CompanyInvoicesComponent } from './company/company-invoices/company-invoices.component';
import { CompanyDialogComponent } from './company/company-dialog/company-dialog.component';
import { SettingsModule } from '../settings/settings.module';

@NgModule({
  declarations: [
    CustomersComponent,
    CompanyComponent,
    CompanyAddressesComponent,
    CompanyEmployeesComponent,
    CompanyOrdersComponent,
    CompanyInvoicesComponent,
    CompanyDialogComponent,
  ],
  imports: [
    CommonModule,
    CustomersRouting,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    MatTabsModule,
    SharedModule,
    SettingsModule,
  ],
})
export class CustomersModule {}
