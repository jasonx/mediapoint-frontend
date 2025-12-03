import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesComponent } from './quotes.component';
import { QuotesRouting } from './quotes.routing';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { QuoteDetailsComponent } from './quote-details/quote-details.component';

@NgModule({
  declarations: [QuotesComponent, QuoteDetailsComponent],
  imports: [
    CommonModule,
    QuotesRouting,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
})
export class QuotesModule {}
