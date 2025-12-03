import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { API_URL, UrlGenerator } from './api-urls';
import { ICategory, IProduct } from '../models/product.model';
import { ICategoryList } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private readonly apiService: ApiService) {}

  getCategoryList(): Observable<ICategoryList[]> {
    return this.apiService.get(API_URL.CATEGORY_LIST);
  }

  getCategoryData(categoryId: string): Observable<ICategory> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CATEGORY_BY_ID, { categoryId })
    );
  }

  getProductData(productId: string): Observable<IProduct> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.PRODUCT_BY_ID, { productId })
    );
  }
}
