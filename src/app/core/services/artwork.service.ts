import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IArtworkData, IArtworkRequest } from '../models/artwork.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { CreateOrderService } from './create-order.service';

@Injectable({
  providedIn: 'root',
})
export class ArtworkService {
  constructor(
    private readonly apiService: ApiService,
    private orderService: CreateOrderService
  ) {}

  getArtworks(): Observable<IArtworkData> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.ARTWORKS, {
        cartId: this.orderService.cartId.value,
      })
    );
  }

  saveArtworks(
    artworkRequestData: IArtworkRequest
  ): Observable<{ message: string }> {
    return this.apiService.postFormData(
      UrlGenerator.generate(API_URL.ARTWORKS, {
        cartId: this.orderService.cartId.value,
      }),
      artworkRequestData
    );
  }
}
