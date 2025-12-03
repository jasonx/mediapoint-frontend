import { InvoiceStatus, JobStatus, OrderStatus } from '../enums/status.enum';
import { ICompanyDetails } from './company-details.model';
import { IOrderJobItem } from './orders.model';

export interface ICustomerItem {
  id: string;
  companyName: string;
  mainContact: string;
  email: string;
  phone: string;
  type: string;
}

export interface ICustomerDetails extends ICompanyDetails {
  id: string;
  companyName: string;
  mainContact?: string;
  website: string;
  email: string;
  secondEmail?: string;
  phone: string;
  type: string;
  ordersCount: number;
  ordersSum: number;
  newJobs: number;
  jobsInProgress: number;
  completedJobs: number;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
}

export type ICompanyItems =
  | ICompanyAddressItem
  | ICompanyEmployeeItem
  | ICompanyOrderItem
  | ICompanyJobItem
  | ICompanyInvoiceItem;

export interface ICompanyAddressItem {
  id: string;
  userId: number;
  companyName: string;
  contactName: string;
  phone: string;
  address1: string;
}

export interface ICompanyEmployeeItem {
  id: string;
  mainContact: string;
  email: string;
  typeUser: string;
  createdAt: string;
}

export interface ICompanyOrderItem {
  id: string;
  accepted: string;
  totalPrice: string;
  customer: string;
  status: OrderStatus;
  jobs: IOrderJobItem[];
}

export interface ICompanyJobItem {
  id: string;
  productName: string;
  productIcon: string;
  quantity: number;
  price: number;
  accepted: string;
  status: JobStatus;
}

export interface ICompanyInvoiceItem {
  id: string;
  createdAt: string;
  dueDate: string;
  total: string;
  status: InvoiceStatus;
}
