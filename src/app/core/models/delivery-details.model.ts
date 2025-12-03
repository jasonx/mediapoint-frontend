import { AnswerYesNo } from '../enums/answer-yes-no.enum';
import { ICartSummaryData } from './cart.mode';
import { IFile } from './file.model';

export interface ISettingsDeliveryDetails {
  addLogoToBox: AnswerYesNo | boolean;
  deliveryType: DeliveryType | string;
  defaultAddressId: number | null;
  addressOptions: {
    id: number;
    label: string;
  }[];
  defaultUsersAddressId: number | null;
  deliveryUsersOptions: {
    id: number;
    label: string;
  }[];
}

export interface IDeliveryDetailsData {
  cartId: string;
  cartJobIds: number[];
  cartDetails: ICartSummaryData;
  deliveryDetails: IDeliveryDetails;
}

export interface IDeliveryJob {
  id: number;
  productImageUrl: string;
  productType: string;
  labelSize: string;
  totalQuantity: string;
  price: string;
}

export interface IDeliveryDetails {
  contactName?: string;
  deliveryType: DeliveryType;
  poNumber?: string;
  phone?: string;
  newAddressState?: string;
  newAddressPostcode?: string;
  dispatchEmail?: string;
  availableDispatchEmail?: { [key: number]: string };
  dispatchEmail2?: string;
  boxLabel?: IFile;
  deliveryAddressType?: DeliveryAddressType;
  newAddressCompanyName?: string;
  newAddressAddress1?: string;
  newAddressAddress2?: string;
  newAddressSuburb?: string;
  newAddressType?: string;
  selectedAddressId?: number;
  deliveryInstruction?: string;
  addLogoToConsignmentLogo?: AnswerYesNo | boolean;
  authorityToLeave?: boolean;
  addressBookOptions?: {
    id: number;
    label: string;
  }[];
  dispatchEmailDescription?: string;
  dispatchEmail2Description?: string;
}

export enum DeliveryType {
  Delivery = 'delivery',
  Pickup = 'pickup',
}

export enum DeliveryAddressType {
  NewAddress = 'new_address',
  FromAddressBook = 'from_address_book',
}
