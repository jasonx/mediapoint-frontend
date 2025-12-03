import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { IGoogleReviews } from '../models/google-reviews.model';
import { API_URL } from './api-urls';

@Injectable({
  providedIn: 'root',
})
export class GoogleReviewsService {
  constructor(private readonly apiService: ApiService) {}

  getReviews(): Observable<IGoogleReviews> {
    return this.apiService.get(API_URL.GOOGLE_REVIEWS);
  }
}
