import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserItem } from '../models/user.model';
import { API_URL, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { CustomersService } from './customers.service';
import { ISettingsPersonalInformation } from '../models/personal-information.model';
import { ICompanyDetails } from '../models/company-details.model';
import { ISettingsDeliveryDetails } from '../models/delivery-details.model';
import { convertAnswerToBoolean } from '../../shared/utils/convert-answer';
import { map } from 'rxjs/operators';
import { removeEmptyFromObj } from '../../shared/utils/remove-empty';
import { INotificationsSettingsItem } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private readonly apiService: ApiService,
    private customersService: CustomersService
  ) {}

  saveEmployee(
    data: IUserItem,
    isCustomersPage?: boolean
  ): Observable<IUserItem> {
    const isEdit = data.id;

    if (isCustomersPage) {
      return isEdit
        ? this.customersService.editEmployee(data)
        : this.customersService.addNewEmployee(data);
    }

    return isEdit ? this.editEmployee(data) : this.addNewEmployee(data);
  }

  addNewEmployee(data: IUserItem): Observable<IUserItem> {
    return this.apiService.post(API_URL.SETTINGS_EMPLOYEE, data);
  }

  editEmployee(data: IUserItem): Observable<IUserItem> {
    return this.apiService.put(API_URL.SETTINGS_EMPLOYEE, data);
  }

  getPersonalSettings(): Observable<ISettingsPersonalInformation> {
    return this.apiService.get(API_URL.SETTINGS_PERSONAL);
  }

  postPersonalSettings(
    data: ISettingsPersonalInformation
  ): Observable<ISettingsPersonalInformation> {
    return this.apiService.post(
      API_URL.SETTINGS_PERSONAL,
      removeEmptyFromObj(data)
    );
  }

  getCompanySettings(customerId?: string): Observable<ICompanyDetails> {
    return this.apiService.get(
      customerId
        ? UrlGenerator.generate(API_URL.CUSTOMERS_BY_ID, { customerId })
        : API_URL.SETTINGS_COMPANY_DETAILS
    );
  }

  postCompanySettings(
    data: ICompanyDetails,
    customerId?: string
  ): Observable<{ message: string }> {
    return customerId
      ? this.apiService.postFormData(
          UrlGenerator.generate(API_URL.CUSTOMERS_BY_ID, {
            customerId,
          }),
          { ...data, id: customerId }
        )
      : this.apiService.postFormData(API_URL.SETTINGS_COMPANY_DETAILS, data);
  }

  getDeliverySettings(): Observable<ISettingsDeliveryDetails> {
    return this.apiService.get(API_URL.SETTINGS_DELIVERY);
  }

  postDeliverySettings(
    data: ISettingsDeliveryDetails
  ): Observable<{ message: string }> {
    function prepareDeliveryDetails(
      input: ISettingsDeliveryDetails
    ): ISettingsDeliveryDetails {
      return {
        addLogoToBox: convertAnswerToBoolean(input.addLogoToBox),
        deliveryType: input.deliveryType.toLowerCase(),
        defaultAddressId: input.defaultAddressId,
        addressOptions: input.addressOptions,
        defaultUsersAddressId: input.defaultUsersAddressId,
        deliveryUsersOptions: input.deliveryUsersOptions,
      };
    }

    return this.apiService.post(
      API_URL.SETTINGS_DELIVERY,
      prepareDeliveryDetails(data)
    );
  }

  getNotificationsSettings(): Observable<INotificationsSettingsItem[]> {
    return this.apiService
      .get(API_URL.SETTINGS_NOTIFICATION)
      .pipe(map((x) => x.settings));
  }

  postNotificationsSettings(data: {
    settings: INotificationsSettingsItem[];
  }): Observable<{ message: string }> {
    return this.apiService.post(API_URL.SETTINGS_NOTIFICATION, data);
  }
}
