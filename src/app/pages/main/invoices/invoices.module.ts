import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesComponent } from './invoices.component';
import { InvoicesRouting } from './invoices.routing';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from 'src/app/shared/shared.module';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [InvoicesComponent, InvoiceDetailsComponent],
  imports: [
    CommonModule,
    InvoicesRouting,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
})
export class InvoicesModule {}
