import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDashboardAdmin, IDashboardCustomer } from '../models/dashboard.model';
import { API_URL, forAdmin } from './api-urls';
import { ApiService } from './api.service';
import { AuthorizationService } from './authorization.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private readonly apiService: ApiService,
    private authorizationService: AuthorizationService
  ) {}

  getDashboardData(
    queryParams: string = ''
  ): Observable<IDashboardAdmin | IDashboardCustomer> {
    return this.apiService.get(
      forAdmin(this.isAdmin, API_URL.DASHBOARD + queryParams)
    );
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }
}
