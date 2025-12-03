import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { DeliveryDetailsComponent } from './delivery-details/delivery-details.component';
import { ArtworkPageComponent } from './artwork-page/artwork-page.component';
import { ArtworkDetailsComponent } from './artwork-page/artwork-details/artwork-details.component';
import { ArtworkEditComponent } from './artwork-page/artwork-edit/artwork-edit.component';

const routes: Routes = [
  {
    path: '',
    component: CartComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CartPageComponent,
      },
      {
        path: 'delivery-details',
        component: DeliveryDetailsComponent,
      },
      {
        path: 'artwork',
        component: ArtworkPageComponent,
        data: { page: 'artwork' }
      },
      {
        path: 'artwork-details/:jobId',
        component: ArtworkDetailsComponent,
      },
      {
        path: 'artwork-details/edit/:jobId/:artworkId',
        component: ArtworkEditComponent,
      },
      {
        path: 'checkout',
        component: ArtworkPageComponent,
        data: { page: 'checkout' }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRouting {}
