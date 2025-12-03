import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { InvoicesComponent } from './invoices.component';

const routes: Routes = [
  {
    path: '',
    component: InvoicesComponent,
    pathMatch: 'full',
  },
  {
    path: ':invoiceId',
    component: InvoiceDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRouting {}
