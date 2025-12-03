import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WidgetsKey } from '../enums/widget-key.enum';
import {
  IComposeProduct,
  IComposeProductResponse,
  IQuantityPrice,
  IQuantityPricePostData,
  ISummary,
  IWidgetPostData,
} from '../models/compose-product.model';
import { IPriceDetails } from '../models/price-details.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ComposeProductService {
  public isLoadedWidget: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public toggleWidgetKey: BehaviorSubject<WidgetsKey | null> =
    new BehaviorSubject<WidgetsKey | null>(null);
  public priceDetails: BehaviorSubject<IPriceDetails> = new BehaviorSubject(
    {} as IPriceDetails
  );
  public completedSteps: BehaviorSubject<ISummary['completedSteps'] | []> =
    new BehaviorSubject<ISummary['completedSteps'] | []>([]);
  public desiredPrintType: string | undefined;

  constructor(private readonly apiService: ApiService) {}

  getAllWidgets(
    jobId: string | null,
    cartId?: string | null
  ): Observable<IComposeProduct | IComposeProductResponse> {
    return this.apiService.get(
      jobId
        ? UrlGenerator.generate(API_URL.COMPOSE_PRODUCTS_BY_ID, { jobId })
        : API_URL.GET_COMPOSE_PRODUCTS + (cartId ? `?cart_id=${cartId}` : '')
    );
  }

  postWidgetData(
    jobId: string | null,
    postData: IWidgetPostData
  ): Observable<IComposeProductResponse> {
    if (jobId) {
      return this.apiService.patch(
        UrlGenerator.generate(API_URL.COMPOSE_PRODUCTS_BY_ID, { jobId }),
        postData
      );
    }

    return this.apiService.post(API_URL.CREATE_JOB, postData);
  }

  calculatePrice(
    jobId: string,
    postData: IQuantityPricePostData
  ): Observable<IQuantityPrice> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.CALCULATE_PRICE, { jobId }),
      postData
    );
  }

  deleteOrder(cartId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.CART_BY_ID, { cartId })
    );
  }
}
