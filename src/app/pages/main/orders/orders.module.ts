import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { OrdersRouting } from './orders.routing';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { ConfirmChangesComponent } from './confirm-changes/confirm-changes.component';
import { AttachmentsComponent } from './order-details/attachments/attachments.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { CartDialogComponent } from '../invoices/invoice-details/cart-dialog/cart-dialog.component';
import { ModalArtworksGalleryComponent } from './modal-artworks-gallery/modal-artworks-gallery.component';

@NgModule({
  declarations: [
    OrdersComponent,
    OrderDetailsComponent,
    JobDetailsComponent,
    ConfirmChangesComponent,
    AttachmentsComponent,
    CartDialogComponent,
    ModalArtworksGalleryComponent,
  ],
  imports: [
    CommonModule,
    OrdersRouting,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
})
export class OrdersModule {}
