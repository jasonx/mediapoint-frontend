import { Component, Input } from '@angular/core';
import { ICartSummaryData } from '../../../core/models/cart.mode';
import { DeliveryType } from 'src/app/core/models/delivery-details.model';
import { capitalizeFirstLetter } from 'src/app/shared/utils/capitalize-first-letter';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.less'],
})
export class CartSummaryComponent {
  @Input() set cartData(data: ICartSummaryData) {
    this.data = data;
    this.isDeliveryType = this.data?.deliveryType.toLowerCase() === DeliveryType.Delivery;
    this.shippingMethod = this.isDeliveryType 
      ? this.data?.carrierDisplayName || 'N/A' 
      : capitalizeFirstLetter(DeliveryType.Pickup);

    if (!this.isDeliveryType && this.data.priceDetails.shipping === 0) {
      delete this.data.priceDetails.shipping;
    }
  };
  @Input() file: File | null;

  data: ICartSummaryData;
  isDeliveryType: boolean;
  shippingMethod: string;
}
