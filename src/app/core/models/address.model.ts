import { AddressType } from '../enums/address-type.enum';

export interface IAddressItem {
  id: string;
  companyName: string;
  address1: string;
  address2: string;
  type: AddressType;
}

export interface IAddress {
  id?: string;
  companyName: string;
  contactName: string;
  phone: string;
  address1: string;
  address2: string;
  dispatchEmail: string;
  dispatchEmail2?: string;
  state: string;
  postcode: string;
  suburb: string;
  type: AddressType;
}

export interface IAddressBySearch {
  id: string;
  shortAddress: string;
}

export interface IDataByAddress {
  addressLine: string;
  state: string;
  suburb: string;
  postcode: string;
}
