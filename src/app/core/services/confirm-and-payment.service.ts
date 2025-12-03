import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IConfirmationData } from '../models/confirm-and-payment.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { CreateOrderService } from './create-order.service';

@Injectable({
  providedIn: 'root',
})
export class ConfirmAndPaymentService {
  constructor(
    private readonly apiService: ApiService,
    private orderService: CreateOrderService
  ) {}

  getConfirmationData(): Observable<IConfirmationData> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CONFIRMATION, {
        cartId: this.orderService.cartId.value,
      })
    );
  }

  confirmPayment(): Observable<any> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.PAYMENT_CONFIRM, {
        cartId: this.orderService.cartId.value,
      })
    );
  }

  paymentComplete(securedCardData: string): Observable<{
    message: string;
    errors: string[];
  }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.PAYMENT_COMPLETE, {
        cartId: this.orderService.cartId.value,
      }),
      { securedCardData }
    );
  }
}
