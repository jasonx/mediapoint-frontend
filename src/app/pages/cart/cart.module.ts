import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart.component';
import { CartRouting } from './cart.routing';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { CartPageComponent } from './cart-page/cart-page.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';
import { DeliveryDetailsComponent } from './delivery-details/delivery-details.component';
import { AddressFromBookFormComponent } from './delivery-details/address-from-book-form/address-from-book-form.component';
import { BaseDeliveryFormComponent } from './delivery-details/base-delivery-form/base-delivery-form.component';
import { EnterAddressFormComponent } from './delivery-details/enter-address-form/enter-address-form.component';
import { PickupFormComponent } from './delivery-details/pickup-form/pickup-form.component';
import { ArtworkPageComponent } from './artwork-page/artwork-page.component';
import { ArtworkDetailsComponent } from './artwork-page/artwork-details/artwork-details.component';
import { ArtworkEditComponent } from './artwork-page/artwork-edit/artwork-edit.component';
import { ArtworkCardComponent } from './artwork-page/artwork-details/artwork-card/artwork-card.component';
import { QuantityComponent } from './artwork-page/artwork-details/quantity/quantity.component';
import { PaymentDialogComponent } from './artwork-page/payment-dialog/payment-dialog.component';

@NgModule({
  declarations: [
    CartComponent,
    CartPageComponent,
    CartSummaryComponent,
    DeliveryDetailsComponent,
    BaseDeliveryFormComponent,
    AddressFromBookFormComponent,
    EnterAddressFormComponent,
    PickupFormComponent,
    ArtworkPageComponent,
    ArtworkDetailsComponent,
    ArtworkEditComponent,
    ArtworkCardComponent,
    QuantityComponent,
    PaymentDialogComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    CartRouting,
    MatExpansionModule,
  ],
})
export class CartModule {}
