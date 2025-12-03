import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICart } from '../models/review-cart.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewCartService {
  constructor(private readonly apiService: ApiService) {}

  getAllJobs(cartId: string | null): Observable<ICart> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CART_BY_ID, { cartId })
    );
  }

  deleteJob(jobId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.JOB_BY_ID, { jobId })
    );
  }

  checkoutJobs(cartId: string): Observable<any> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.CART_CHECKOUT, { cartId })
    );
  }
}
