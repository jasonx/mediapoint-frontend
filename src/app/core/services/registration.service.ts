import { Injectable } from '@angular/core';
import { API_URL } from './api-urls';
import { IPersonalInformation } from '../models/personal-information.model';
import { ApiService } from './api.service';
import { ICustomerInformation } from '../models/customer-information.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(private apiService: ApiService) {}

  personalInformation(
    data: IPersonalInformation
  ): Observable<{ message: string }> {
    return this.apiService.post(API_URL.PERSONAL_INFORMATION, data);
  }

  customerInformation(
    data: ICustomerInformation
  ): Observable<{ message: string }> {
    return this.apiService.post(API_URL.CUSTOMER_INFORMATION, data);
  }

  verifyEmail(
    isLoginPage: boolean,
    requestId: string,
    token: string
  ): Observable<{ message: string }> {
    return this.apiService.get(
      (isLoginPage ? API_URL.VERIFY_EMAIL : API_URL.CONFIRM_EMAIL) +
        `?request_id=${requestId}&token=${token}`
    );
  }
}
