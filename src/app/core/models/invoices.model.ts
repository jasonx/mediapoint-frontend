import { InvoiceStatus } from '../enums/status.enum';
import { IPriceDetails } from './price-details.model';
import { IJobTableData } from './table.model';

export interface IInvoiceItem {
  id: string;
  poNumber: string;
  fullName: string;
  createdAt: string;
  dueDate: string;
  total: string;
  status: InvoiceStatus;
}

export interface IInvoiceDetails {
  id: string;
  poNumber: string;
  createdAt: string;
  dueDate: string;
  status: InvoiceStatus;
  general: string[];
  billTo: IInvoiceAddress;
  shipTo: IInvoiceAddress;
  jobs: IJobTableData[];
  priceDetails: IPriceDetails;
  cartId: string;
  orderId: number;
}

export interface IInvoiceAddress {
  companyName: string;
  address1: string;
  address2: string;
  suburb: string;
  postcode: string;
  state: string;
}
