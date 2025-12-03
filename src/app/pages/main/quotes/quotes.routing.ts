import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteDetailsComponent } from './quote-details/quote-details.component';
import { QuotesComponent } from './quotes.component';

const routes: Routes = [
  {
    path: '',
    component: QuotesComponent,
    pathMatch: 'full',
  },
  {
    path: ':id',
    component: QuoteDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotesRouting {}
