import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDetailsComponent } from '../invoices/invoice-details/invoice-details.component';
import { JobDetailsComponent } from '../orders/job-details/job-details.component';
import { OrderDetailsComponent } from '../orders/order-details/order-details.component';
import { CompanyComponent } from './company/company.component';
import { CustomersComponent } from './customers.component';

const routes: Routes = [
  {
    path: '',
    component: CustomersComponent,
    pathMatch: 'full',
  },
  {
    path: 'company/:id',
    component: CompanyComponent,
  },
  {
    path: 'company/:id/order/:orderId',
    component: OrderDetailsComponent,
  },
  {
    path: 'company/:id/job/:jobId',
    component: JobDetailsComponent,
  },
  {
    path: 'company/:id/invoices/:invoiceId',
    component: InvoiceDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersRouting {}
