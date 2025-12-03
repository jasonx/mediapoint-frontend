import { AccountUsageDataType } from '../enums/account-usage-type.enum';

export interface ICustomerInformation {
  registrationRequestToken?: string;
  type: AccountUsageDataType;
  firstName: string;
  lastName: string;
  companyName: string;
  address1: string;
  address2: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  website: string;
  email: string;
  abn: string;
}
