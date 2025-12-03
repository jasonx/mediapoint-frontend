import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MyProductsRouting } from './my-products.routing';
import { MyProductsComponent } from './my-products.component';

@NgModule({
  declarations: [MyProductsComponent],
  imports: [
    CommonModule,
    MyProductsRouting,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
})
export class MyProductsModule {}
