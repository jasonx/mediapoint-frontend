import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressComponent } from './address.component';
import { AddressRouting } from './address.routing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '../../../shared/shared.module';
import { AddressDialogComponent } from './address-dialog/address-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [AddressComponent, AddressDialogComponent],
  imports: [
    CommonModule,
    AddressRouting,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
})
export class AddressModule {}
