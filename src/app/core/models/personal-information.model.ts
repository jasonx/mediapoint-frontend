import { AccountUsageDataType } from '../enums/account-usage-type.enum';

export interface IPersonalInformation {
  firstName: string;
  email: string;
  password: string;
  phone: string;
  abn: string;
  type: AccountUsageDataType | null;
}

export interface ISettingsPersonalInformation {
  firstName: string;
  lastName: string;
  contactEmail: string;
  additionalContactEmail: string | null;
}
