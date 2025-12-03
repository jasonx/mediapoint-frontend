import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFilterDefaultValues } from '../models/filter.model';
import { ITableRequest } from '../models/table.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { IMyProductsItem } from '../models/my-products.model';
import { IComposeProductResponse } from '../models/compose-product.model';

@Injectable({
  providedIn: 'root',
})
export class MyProductsService {
  constructor(private readonly apiService: ApiService) {}

  getMyProducts(
    queryParams: string
  ): Observable<ITableRequest<IMyProductsItem[]>> {
    return this.apiService.get(API_URL.MY_PRODUCTS + queryParams);
  }

  getMyProductsFilter(): Observable<IFilterDefaultValues> {
    return this.apiService.get(API_URL.MY_PRODUCTS_FILTER);
  }

  getMyProduct(id: string): Observable<IComposeProductResponse> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.MY_PRODUCTS_BY_ID, {
        id,
      })
    );
  }

  editMyProductName(
    id: string,
    productName: string
  ): Observable<{ message: string }> {
    return this.apiService.put(
      UrlGenerator.generate(API_URL.MY_PRODUCTS_BY_ID, {
        id,
      }),
      { productName }
    );
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.MY_PRODUCTS_BY_ID, {
        id,
      })
    );
  }

  addMyProductToCart(jobId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.MY_PRODUCTS_ADD_TO_CART, {
        jobId,
      })
    );
  }
}
