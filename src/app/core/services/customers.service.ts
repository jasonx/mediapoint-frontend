import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAddress } from '../models/address.model';
import {
  ICompanyAddressItem,
  ICompanyEmployeeItem,
  ICompanyInvoiceItem,
  ICompanyOrderItem,
  ICustomerDetails,
  ICustomerItem,
} from '../models/customers.model';
import { ITableRequest } from '../models/table.model';
import { IUserItem } from '../models/user.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  public companyId: string;

  constructor(private readonly apiService: ApiService) {}

  getCustomersList(
    queryParams: string
  ): Observable<ITableRequest<ICustomerItem[]>> {
    return this.apiService.get(API_URL.CUSTOMERS + queryParams);
  }

  getCustomersDetails(): Observable<ICustomerDetails> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_BY_ID, {
        customerId: this.companyId,
      })
    );
  }

  getCompanyAddresses(
    queryParams: string
  ): Observable<ITableRequest<ICompanyAddressItem[]>> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_ADDRESS, {
        customerId: this.companyId,
      }) + queryParams
    );
  }

  getCompanyAddress(addressId: string): Observable<IAddress> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_USER_ADDRESS, {
        customerId: this.companyId,
        addressId,
      })
    );
  }

  addNewAddress(data: IAddress): Observable<IAddress> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.CUSTOMERS_ADDRESS, {
        customerId: this.companyId,
      }),
      data
    );
  }

  editAddress(data: IAddress): Observable<IAddress> {
    return this.apiService.put(
      UrlGenerator.generate(API_URL.CUSTOMERS_USER_ADDRESS, {
        customerId: this.companyId,
        addressId: data.id,
      }),
      data
    );
  }

  getCompanyEmployees(
    queryParams: string
  ): Observable<ITableRequest<ICompanyEmployeeItem[]>> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_EMPLOYEES, {
        customerId: this.companyId,
      }) + queryParams
    );
  }

  getCompanyEmployee(userId: number): Observable<IUserItem> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_USER_EMPLOYEE, {
        customerId: this.companyId,
        userId,
      })
    );
  }

  addNewEmployee(data: IUserItem): Observable<IUserItem> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.CUSTOMERS_EMPLOYEE, {
        customerId: this.companyId,
      }),
      data
    );
  }

  editEmployee(data: IUserItem): Observable<IUserItem> {
    return this.apiService.put(
      UrlGenerator.generate(API_URL.CUSTOMERS_USER_EMPLOYEE, {
        customerId: this.companyId,
        userId: data.id,
      }),
      data
    );
  }

  getCompanyOrders(
    queryParams: string
  ): Observable<ITableRequest<ICompanyOrderItem[]>> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_ORDERS, {
        customerId: this.companyId,
      }) + queryParams
    );
  }

  getCompanyInvoices(
    queryParams: string
  ): Observable<ITableRequest<ICompanyInvoiceItem[]>> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.CUSTOMERS_INVOICES, {
        customerId: this.companyId,
      }) + queryParams
    );
  }

  deleteCustomer(id: string): Observable<{ message: string }> {
    return this.apiService.delete(`${API_URL.CUSTOMERS}/${id}`);
  }

  deleteCustomers(customersIds: string[]): Observable<{ message: string }> {
    return this.apiService.delete(API_URL.CUSTOMERS, { ids: customersIds });
  }

  deleteAddress(addressId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.CUSTOMERS_USER_ADDRESS, {
        customerId: this.companyId,
        addressId,
      })
    );
  }

  deleteEmployee(userId: number): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.CUSTOMERS_USER_EMPLOYEE, {
        customerId: this.companyId,
        userId,
      })
    );
  }
}
