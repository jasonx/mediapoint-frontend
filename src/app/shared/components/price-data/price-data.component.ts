import { Component, Input } from '@angular/core';
import { IDeliveryJob } from 'src/app/core/models/delivery-details.model';
import { IPriceDetails } from 'src/app/core/models/price-details.model';

@Component({
  selector: 'app-price-data',
  templateUrl: './price-data.component.html',
  styleUrls: ['./price-data.component.less'],
})
export class PriceDataComponent {
  @Input() title: string;
  @Input() priceDetails: IPriceDetails | null;
  @Input() jobs: IDeliveryJob[];
  @Input() isInvoice: boolean;

  get isShippingString(): boolean {
    if (!this.priceDetails?.shippingPrice) {
      return false;
    }

    return isNaN(+this.priceDetails.shippingPrice);
  }
}
