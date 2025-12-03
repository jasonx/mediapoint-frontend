import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IAddress,
  IAddressBySearch,
  IAddressItem,
  IDataByAddress,
} from '../models/address.model';
import { ITableRequest } from '../models/table.model';
import { ApiService } from './api.service';
import { API_URL, UrlGenerator } from './api-urls';
import { CustomersService } from './customers.service';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  constructor(
    private readonly apiService: ApiService,
    private customersService: CustomersService
  ) {}

  getAddresses(queryParams: string): Observable<ITableRequest<IAddressItem[]>> {
    return this.apiService.get(API_URL.ADDRESSES + queryParams);
  }

  getAddress(addressId: string): Observable<IAddress> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.ADDRESS_BY_ID, { addressId })
    );
  }

  saveAddress(
    isEdit: boolean,
    data: IAddress,
    isCustomersPage?: boolean
  ): Observable<IAddress> {
    if (isCustomersPage) {
      return isEdit
        ? this.customersService.editAddress(data)
        : this.customersService.addNewAddress(data);
    }

    return isEdit ? this.editAddress(data) : this.addNewAddress(data);
  }

  addNewAddress(data: IAddress): Observable<IAddress> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.ADDRESS_BY_ID, { addressId: data.id }),
      data
    );
  }

  editAddress(data: IAddress): Observable<IAddress> {
    return this.apiService.put(`${API_URL.ADDRESSES}/${data.id}`, data);
  }

  deleteAddress(id: string): Observable<string> {
    return this.apiService.delete(`${API_URL.ADDRESSES}/${id}`);
  }

  searchAddress(value: string): Observable<IAddressBySearch[]> {
    return this.apiService.get(API_URL.ADDRESSR + `?q=${value}`);
  }

  searchAddressInLocation(value: string): Observable<IAddressBySearch[]> {
    return this.apiService.get(API_URL.ADDRESSR_IN_LOCATION + `?q=${value}`);
  }

  getDataByAddressId(id: string): Observable<IDataByAddress> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.ADDRESSR_BY_ID, { id })
    );
  }
}
