import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IDeliveryDetailsData } from '../models/delivery-details.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { CreateOrderService } from './create-order.service';

@Injectable({
  providedIn: 'root',
})
export class DeliveryDetailsService {
  public markAllAsTouched$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly apiService: ApiService,
    private orderService: CreateOrderService
  ) {}

  getDeliveryDetails(): Observable<IDeliveryDetailsData> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.DELIVERY_DETAILS_BY_ID, {
        cartId: this.orderService.cartId.value,
      })
    );
  }

  submitDeliveryDetails(deliveryDate: any): Observable<{ message: string }> {
    return this.apiService.postFormData(
      UrlGenerator.generate(API_URL.DELIVERY_DETAILS_BY_ID, {
        cartId: this.orderService.cartId.value,
      }),
      deliveryDate
    );
  }

  deleteMedia(mediaId: number): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.DELIVERY_DETAILS_MEDIA, {
        cartId: this.orderService.cartId.value,
        mediaId,
      })
    );
  }
}
